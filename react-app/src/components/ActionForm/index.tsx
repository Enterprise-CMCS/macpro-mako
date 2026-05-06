import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DefaultValues, FieldPath, useForm, UseFormReturn } from "react-hook-form";
import { Navigate, useLocation, useNavigate, useParams } from "react-router";
import { Authority, ReactQueryApiError, SEATOOL_STATUS, UserDetails } from "shared-types";
import { isStateUser } from "shared-utils";
import { z } from "zod";

import { itemExists, saveDraft, useGetItem, useGetUserDetails } from "@/api";
import {
  ActionFormDescription,
  Banner,
  banner,
  BreadCrumbs,
  Button,
  dismissBanner,
  ErrorAlert,
  FAQFooter,
  Form,
  FormField,
  LoadingSpinner,
  optionCrumbsFromPath,
  PreSubmissionMessage,
  RequiredFieldDescription,
  RequiredIndicator,
  SectionCard,
  SimplePageContainer,
  UserPrompt,
  userPrompt,
} from "@/components";
import { useNavigationPrompt } from "@/hooks";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { getFormOrigin, queryClient } from "@/utils";
import {
  consumeDraftContinueConfirmed,
  DRAFT_ID_CONFLICT_MESSAGE,
  getDraftIdConflictFieldMessage,
  getNonOwnerDraftWarningModalBody,
  isCurrentUserDraftActor,
} from "@/utils/drafts";
import { CheckDocumentFunction, documentPoller } from "@/utils/Poller/documentPoller";
import { sendGAEvent } from "@/utils/ReactGA/SendGAEvent";

import { mapSubmissionTypeBasedOnActionFormTitle } from "../../utils/ReactGA/Mapper";
import { getAttachments } from "./actionForm.utilities";
import { ActionFormAttachments, AttachmentsOptions } from "./ActionFormAttachments";
import { AdditionalInformation } from "./AdditionalInformation";

type EnforceSchemaProps<Shape extends z.ZodRawShape> = z.ZodObject<
  Shape & {
    attachments?: z.ZodObject<{
      [Key in keyof Shape]: z.ZodObject<{
        label: z.ZodDefault<z.ZodString>;
        files: z.ZodArray<z.ZodTypeAny, "many"> | z.ZodOptional<z.ZodArray<z.ZodTypeAny, "many">>;
      }>;
    }>;
  },
  "strip",
  z.ZodTypeAny
>;

export type SchemaWithEnforcableProps<Shape extends z.ZodRawShape = z.ZodRawShape> =
  | z.ZodEffects<EnforceSchemaProps<Shape>>
  | EnforceSchemaProps<Shape>;

export type InferUntransformedSchema<T> = T extends z.ZodEffects<infer U> ? U : T;

export type FormArg<Schema extends SchemaWithEnforcableProps> = UseFormReturn<
  z.infer<InferUntransformedSchema<Schema>>
>;

export type ActionFormFieldsArg<Schema extends SchemaWithEnforcableProps> = FormArg<Schema> & {
  isDraftMode: boolean;
};

type DraftOptions = {
  enabled: boolean;
  event: string;
  idPath?: string;
  authorityPath?: string;
  requiredSaveFields?: Array<{
    path: string;
    message: string;
  }>;
};

type DraftSaveStatus = {
  variant: "saving" | "success" | "error" | "dirty";
  message: string;
};

type ActionFormProps<Schema extends SchemaWithEnforcableProps> = {
  schema: Schema;
  defaultValues?: DefaultValues<z.infer<InferUntransformedSchema<Schema>>>;
  title: string;
  fields: (form: ActionFormFieldsArg<Schema>) => ReactNode;
  submitButtonLabel?: string;
  bannerPostSubmission?: Omit<Banner, "pathnameToDisplayOn">;
  promptPreSubmission?: Omit<UserPrompt, "onAccept">;
  promptOnLeavingForm?: Omit<UserPrompt, "onAccept">;
  attachments?: AttachmentsOptions;
  additionalInformation?:
    | {
        required: boolean;
        title: string;
        label: string;
      }
    | false;
  documentPollerArgs: {
    property: (keyof z.TypeOf<Schema> & string) | ((values: z.TypeOf<Schema>) => string);
    documentChecker: CheckDocumentFunction;
  };
  conditionsDeterminingUserAccess?: ((user: UserDetails | null) => boolean)[];
  breadcrumbText: string;
  formDescription?: string | React.ReactNode;
  preSubmissionMessage?: string;
  showPreSubmissionMessage?: boolean;
  areFieldsRequired?: boolean;
  showFAQFooter?: boolean;
  footer?: (args: {
    form: FormArg<Schema>;
    onSubmit: () => void;
    onCancel: (promptOverride?: Partial<Omit<UserPrompt, "onAccept">>) => void;
    onSaveDraft?: () => void;
    isDraftMode?: boolean;
  }) => ReactNode;
  draftOptions?: DraftOptions;
};

const getValueByPath = (values: Record<string, unknown>, path: string) => {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (!acc || typeof acc !== "object") return undefined;
    return (acc as Record<string, unknown>)[key];
  }, values);
};

const DRAFT_SAVE_ROUTE_TRANSITION_KEY = "onemac:draft-save-route-transition";
const DRAFT_SAVE_ROUTE_TRANSITION_TTL_MS = 30_000;

type DraftSaveRouteTransition = {
  id: string;
  pathname: string;
  expiresAt: number;
};

const normalizeDraftRouteTransitionId = (id?: string | null) => id?.trim().toUpperCase() || "";

const clearDraftSaveRouteTransition = () => {
  try {
    sessionStorage.removeItem(DRAFT_SAVE_ROUTE_TRANSITION_KEY);
  } catch {
    // Storage may be unavailable in private/locked-down contexts.
  }
};

const readDraftSaveRouteTransition = (pathname: string): DraftSaveRouteTransition | null => {
  try {
    const rawTransition = sessionStorage.getItem(DRAFT_SAVE_ROUTE_TRANSITION_KEY);
    if (!rawTransition) return null;

    const transition = JSON.parse(rawTransition) as Partial<DraftSaveRouteTransition>;
    const normalizedId = normalizeDraftRouteTransitionId(transition.id);
    const isCurrentRoute = transition.pathname === pathname;
    const isFresh = typeof transition.expiresAt === "number" && transition.expiresAt > Date.now();

    if (!normalizedId || !isCurrentRoute || !isFresh) {
      clearDraftSaveRouteTransition();
      return null;
    }

    return {
      id: normalizedId,
      pathname: transition.pathname,
      expiresAt: transition.expiresAt,
    };
  } catch {
    clearDraftSaveRouteTransition();
    return null;
  }
};

const startDraftSaveRouteTransition = (id: string, pathname: string): DraftSaveRouteTransition => {
  const transition = {
    id: normalizeDraftRouteTransitionId(id),
    pathname,
    expiresAt: Date.now() + DRAFT_SAVE_ROUTE_TRANSITION_TTL_MS,
  };

  try {
    sessionStorage.setItem(DRAFT_SAVE_ROUTE_TRANSITION_KEY, JSON.stringify(transition));
  } catch {
    // The in-memory marker still covers this mounted instance if storage fails.
  }

  return transition;
};

const matchesDraftSaveRouteTransition = (
  transition: DraftSaveRouteTransition | null,
  pathname: string,
  draftId: string | null,
) =>
  Boolean(
    draftId &&
      transition &&
      transition.pathname === pathname &&
      transition.id === draftId &&
      transition.expiresAt > Date.now(),
  );

const getApiErrorStatus = (error: unknown) => {
  const candidate = error as {
    status?: number | string;
    statusCode?: number | string;
    request?: { status?: number | string };
    response?: { status?: number | string; statusCode?: number | string; statusText?: string };
    $metadata?: { httpStatusCode?: number | string };
  };
  const status =
    candidate?.response?.status ??
    candidate?.response?.statusCode ??
    candidate?.request?.status ??
    candidate?.$metadata?.httpStatusCode ??
    candidate?.status ??
    candidate?.statusCode;
  const statusCode = typeof status === "string" ? Number(status) : status;

  return typeof statusCode === "number" && Number.isFinite(statusCode) ? statusCode : undefined;
};

const getApiErrorMessage = (error: unknown) => {
  const candidate = error as {
    message?: unknown;
    response?: { data?: { message?: unknown } | string; statusText?: string };
  };
  const responseData = candidate?.response?.data;

  if (typeof responseData === "string") return responseData;
  if (responseData && typeof responseData === "object" && "message" in responseData) {
    return String(responseData.message ?? "");
  }

  return [candidate?.message, candidate?.response?.statusText].filter(Boolean).join(" ");
};

const isNotFoundApiError = (error: unknown) =>
  getApiErrorStatus(error) === 404 ||
  /status code 404/i.test(getApiErrorMessage(error)) ||
  /\b404\b/i.test(getApiErrorMessage(error)) ||
  /not found/i.test(getApiErrorMessage(error)) ||
  /No record found for the given id/i.test(getApiErrorMessage(error));

export const ActionForm = <Schema extends SchemaWithEnforcableProps>({
  schema,
  defaultValues = {} as DefaultValues<z.TypeOf<InferUntransformedSchema<Schema>>>,
  title,
  fields: Fields,
  submitButtonLabel = "Submit",
  bannerPostSubmission = {
    header: "Package submitted",
    body: "Your submission has been received.",
    variant: "success",
  },
  promptOnLeavingForm = {
    header: "Stop form submission?",
    body: "All information you've entered on this form will be lost if you leave this page.",
    acceptButtonText: "Yes, leave form",
    cancelButtonText: "Return to form",
    areButtonsReversed: true,
  },
  promptPreSubmission,
  documentPollerArgs,
  attachments,
  conditionsDeterminingUserAccess = [isStateUser],
  breadcrumbText,
  formDescription = `Once you submit this form, a confirmation email is sent to you and to CMS.
      CMS will use this content to review your package, and you will not be able
      to edit this form. If CMS needs any additional information, they will
      follow up by email.`,
  preSubmissionMessage,
  additionalInformation = {
    required: false,
    label: "Add anything else you would like to share with CMS.",
    title: "Additional Information",
  },
  showPreSubmissionMessage = true,
  areFieldsRequired = true,
  showFAQFooter = true,
  footer: Footer,
  draftOptions,
}: ActionFormProps<Schema>) => {
  const { id, authority } = useParams<{
    id: string;
    authority: Authority;
    type: string;
  }>();
  const { pathname, search } = useLocation();
  const startTimePage = Date.now();
  const navigate = useNavigate();
  const { data: userObj, isLoading: isUserLoading } = useGetUserDetails();
  const skipNavigationPromptRef = useRef(false);
  const isStickyFooterEnabled = useFeatureFlag("STICKY_FORM_FOOTER");
  const isSaveInProgressEnabled = useFeatureFlag("SAVE_IN_PROGRESS");
  const [footerTriggerElement, setFooterTriggerElement] = useState<HTMLDivElement | null>(null);
  const [isFooterFixed, setIsFooterFixed] = useState(false);
  const [draftSaveStatus, setDraftSaveStatus] = useState<DraftSaveStatus | null>(null);
  const [isDraftSubmissionInProgress, setIsDraftSubmissionInProgress] = useState(false);
  const [draftRouteTransition, setDraftRouteTransition] = useState<DraftSaveRouteTransition | null>(
    () => readDraftSaveRouteTransition(pathname),
  );
  const draftRouteTransitionRef = useRef<DraftSaveRouteTransition | null>(draftRouteTransition);
  const previousDraftIdRef = useRef<string | null>(null);
  const draftSaveStatusRef = useRef<HTMLParagraphElement | null>(null);
  const hasConfirmedNonOwnerDraftActionRef = useRef(false);
  const hasPromptedNonOwnerDraftActionRef = useRef(false);
  const pendingNonOwnerDraftActionRef = useRef<(() => void) | null>(null);
  const draftVersionRef = useRef<{ seqNo?: number; primaryTerm?: number }>({});
  const saveDraftInFlightRef = useRef(false);
  const pendingDraftIdRemovalRef = useRef<string | null>(null);
  const hasRedirectedFromInactiveDraftRef = useRef(false);
  const [draftIdConflict, setDraftIdConflict] = useState<string | null>(null);
  const [currentSessionDraftActor, setCurrentSessionDraftActor] = useState<{
    email?: string | null;
    name?: string | null;
  } | null>(null);
  const draftConflictRevalidationInFlightRef = useRef(false);
  const draftConflictRevalidationTimeoutRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);
  const latestDefaultValuesRef = useRef(defaultValues);

  latestDefaultValuesRef.current = defaultValues;

  const breadcrumbs = optionCrumbsFromPath(pathname, authority, id);
  const draftEnabled = isSaveInProgressEnabled && draftOptions?.enabled === true;
  const effectiveSubmitButtonLabel =
    draftEnabled && submitButtonLabel === "Submit" ? "Save & Submit" : submitButtonLabel;
  const rawDraftId = draftEnabled ? new URLSearchParams(search).get("draftId") : null;
  const draftId = rawDraftId ? rawDraftId.toUpperCase() : null;
  const isDraftMode = draftEnabled && !!draftId;
  const isDraftSaveRouteTransition =
    isDraftMode &&
    (matchesDraftSaveRouteTransition(draftRouteTransition, pathname, draftId) ||
      matchesDraftSaveRouteTransition(draftRouteTransitionRef.current, pathname, draftId));
  const hasAppliedDraftRef = useRef(false);

  const {
    data: draftRecord,
    isLoading: isDraftLoading,
    isFetched: isDraftFetched,
    error: draftError,
  } = useGetItem(
    draftId ?? "",
    { enabled: isDraftMode },
    { includeDraft: true, preferDraft: true },
  );
  const hasLoadedActiveDraftRecord =
    isDraftFetched &&
    draftRecord?._source?.deleted !== true &&
    draftRecord?._source?.seatoolStatus === SEATOOL_STATUS.DRAFT;
  const draftCreatorActor = {
    email:
      draftRecord?._source?.draft?.createdByEmail ?? draftRecord?._source?.draft?.draftOwnerEmail,
    name: draftRecord?._source?.draft?.createdByName ?? draftRecord?._source?.draft?.draftOwnerName,
  };
  const draftUpdaterActor = {
    email: draftRecord?._source?.draft?.updatedByEmail,
    name: draftRecord?._source?.draft?.updatedByName,
  };
  const legacyDraftSubmitterActor = {
    email: draftRecord?._source?.submitterEmail,
    name: draftRecord?._source?.submitterName,
  };
  const draftPackageIdForWarning = draftRecord?._source?.id ?? draftId ?? id ?? "this package";
  const isNonOwnerDraftUser = Boolean(
    isDraftMode &&
      userObj?.email &&
      !isCurrentUserDraftActor(userObj, [
        draftCreatorActor,
        draftUpdaterActor,
        legacyDraftSubmitterActor,
        currentSessionDraftActor ?? {},
      ]),
  );

  const navigateAwayFromDraft = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(getFormOrigin({ id, authority }));
  }, [navigate, id, authority]);

  const promptNonOwnerDraftAction = useCallback(() => {
    userPrompt({
      header: "Confirm action",
      body: getNonOwnerDraftWarningModalBody(draftPackageIdForWarning),
      acceptButtonText: "Yes, continue",
      cancelButtonText: "Cancel",
      cancelVariant: "link",
      onAccept: () => {
        hasConfirmedNonOwnerDraftActionRef.current = true;
        hasPromptedNonOwnerDraftActionRef.current = false;
        const pendingAction = pendingNonOwnerDraftActionRef.current;
        pendingNonOwnerDraftActionRef.current = null;
        pendingAction?.();
      },
      onCancel: () => {
        pendingNonOwnerDraftActionRef.current = null;
        navigateAwayFromDraft();
      },
    });
  }, [draftPackageIdForWarning, navigateAwayFromDraft]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (draftConflictRevalidationTimeoutRef.current) {
        window.clearTimeout(draftConflictRevalidationTimeoutRef.current);
      }
    };
  }, []);

  const form = useForm<z.TypeOf<Schema>>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      ...defaultValues,
    },
  });
  const idPath = draftOptions?.idPath ?? "id";
  const draftIdConflictFieldMessage = useMemo(
    () => getDraftIdConflictFieldMessage(draftOptions?.event),
    [draftOptions?.event],
  );
  const watchedDraftIdValue = draftEnabled
    ? form.watch(idPath as FieldPath<z.TypeOf<Schema>>)
    : undefined;
  const watchedDraftId =
    typeof watchedDraftIdValue === "string" ? watchedDraftIdValue.trim().toUpperCase() : "";
  const isDraftIdConflictActive = Boolean(
    draftIdConflict && watchedDraftId && draftIdConflict === watchedDraftId,
  );

  const hasActiveDraftConflictBanner = useCallback(() => {
    if (typeof window === "undefined") return false;

    try {
      const storedBanner = localStorage.getItem("banner");
      if (!storedBanner || storedBanner === "null") return false;

      const parsedBanner = JSON.parse(storedBanner) as {
        header?: string;
        body?: string;
        pathnameToDisplayOn?: string;
      };

      return (
        parsedBanner.header === "Unable to save package" &&
        parsedBanner.body === DRAFT_ID_CONFLICT_MESSAGE &&
        parsedBanner.pathnameToDisplayOn === window.location.pathname
      );
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (!draftIdConflict) return;
    if (!watchedDraftId || watchedDraftId === draftIdConflict) return;
    setDraftIdConflict(null);
    form.clearErrors(idPath as FieldPath<z.TypeOf<Schema>>);
  }, [draftIdConflict, form, idPath, watchedDraftId]);

  useEffect(() => {
    const previousDraftId = previousDraftIdRef.current;
    const didDraftIdChange = previousDraftId !== draftId;

    if (!isDraftMode) {
      hasAppliedDraftRef.current = false;
      hasPromptedNonOwnerDraftActionRef.current = false;
      hasConfirmedNonOwnerDraftActionRef.current = false;
      pendingNonOwnerDraftActionRef.current = null;
      if (!draftEnabled) {
        draftRouteTransitionRef.current = null;
        setDraftRouteTransition(null);
        clearDraftSaveRouteTransition();
      }

      if (previousDraftId !== null) {
        setDraftSaveStatus(null);
      }

      setDraftIdConflict(null);
      draftVersionRef.current = {};
      setCurrentSessionDraftActor(null);
      previousDraftIdRef.current = draftId;
      return;
    }

    if (didDraftIdChange) {
      hasAppliedDraftRef.current = false;
      setDraftIdConflict(null);

      if (!isDraftSaveRouteTransition) {
        hasPromptedNonOwnerDraftActionRef.current = false;
        hasConfirmedNonOwnerDraftActionRef.current = false;
        pendingNonOwnerDraftActionRef.current = null;
        draftVersionRef.current = {};
        setCurrentSessionDraftActor(null);
        setDraftSaveStatus(null);
      }
    }

    previousDraftIdRef.current = draftId;
  }, [draftEnabled, draftId, isDraftMode, isDraftSaveRouteTransition]);

  useEffect(() => {
    const activeTransition = draftRouteTransition ?? draftRouteTransitionRef.current;

    if (!activeTransition || !draftId) {
      return;
    }

    if (activeTransition.expiresAt <= Date.now()) {
      draftRouteTransitionRef.current = null;
      clearDraftSaveRouteTransition();
      setDraftRouteTransition(null);
      return;
    }

    if (draftId !== activeTransition.id || pathname !== activeTransition.pathname) {
      // We may be between setting the transition target and the URL catching up.
      // This happens when saving an existing draft under a new ID.
      // Do not clear the marker yet, or the route transition will show the page spinner.
      return;
    }
    if (!isDraftLoading && hasLoadedActiveDraftRecord) {
      draftRouteTransitionRef.current = null;
      clearDraftSaveRouteTransition();
      setDraftRouteTransition(null);
      return;
    }

    const timeoutMs = activeTransition.expiresAt - Date.now();
    const timeoutId = window.setTimeout(() => {
      draftRouteTransitionRef.current = null;
      clearDraftSaveRouteTransition();
      setDraftRouteTransition(null);
    }, timeoutMs);

    return () => window.clearTimeout(timeoutId);
  }, [draftId, draftRouteTransition, hasLoadedActiveDraftRecord, isDraftLoading, pathname]);

  useEffect(() => {
    if (!isNonOwnerDraftUser || !draftId || !userObj?.email) return;

    if (consumeDraftContinueConfirmed(draftId, userObj.email)) {
      hasConfirmedNonOwnerDraftActionRef.current = true;
      hasPromptedNonOwnerDraftActionRef.current = false;
    }
  }, [draftId, isNonOwnerDraftUser, userObj?.email]);

  useEffect(() => {
    const pendingDraftIdRemoval = pendingDraftIdRemovalRef.current;

    if (!pendingDraftIdRemoval || pendingDraftIdRemoval === draftId) {
      return;
    }

    queryClient.removeQueries({
      queryKey: ["record", pendingDraftIdRemoval, "preferDraft"],
      exact: true,
    });
    pendingDraftIdRemovalRef.current = null;
  }, [draftId]);

  useEffect(() => {
    if (!isDraftMode || !draftRecord) {
      return;
    }

    if (typeof draftRecord._seq_no === "number" && typeof draftRecord._primary_term === "number") {
      draftVersionRef.current = {
        seqNo: draftRecord._seq_no,
        primaryTerm: draftRecord._primary_term,
      };
    }
  }, [draftRecord, isDraftMode]);

  const canProceedWithNonOwnerDraftAction = (pendingAction?: () => void) => {
    if (!isNonOwnerDraftUser || hasConfirmedNonOwnerDraftActionRef.current) {
      return true;
    }

    pendingNonOwnerDraftActionRef.current = pendingAction ?? null;

    if (!hasPromptedNonOwnerDraftActionRef.current) {
      hasPromptedNonOwnerDraftActionRef.current = true;
      promptNonOwnerDraftAction();
    }

    return false;
  };

  useEffect(() => {
    const draftData = draftRecord?._source?.draft?.data as
      | DefaultValues<z.infer<InferUntransformedSchema<Schema>>>
      | undefined;

    if (!draftData || hasAppliedDraftRef.current) return;

    form.reset({ ...latestDefaultValuesRef.current, ...draftData });
    hasAppliedDraftRef.current = true;
  }, [draftRecord, form]);

  const hasRealChanges = Object.keys(form.formState.dirtyFields).length > 0;

  useEffect(() => {
    if (!draftEnabled) return;

    if (
      hasRealChanges &&
      draftSaveStatus &&
      draftSaveStatus.variant !== "saving" &&
      draftSaveStatus.variant !== "dirty"
    ) {
      setDraftSaveStatus({
        variant: "dirty",
        message: "Unsaved changes",
      });
    }
  }, [draftEnabled, draftSaveStatus, hasRealChanges]);

  useEffect(() => {
    if (!draftEnabled || !draftSaveStatus) return;

    if (draftSaveStatus.variant === "success" || draftSaveStatus.variant === "error") {
      draftSaveStatusRef.current?.focus();
    }
  }, [draftEnabled, draftSaveStatus]);

  const clearDraftIdConflictUI = useCallback(() => {
    setDraftIdConflict(null);

    const draftIdFieldPath = idPath as FieldPath<z.TypeOf<Schema>>;
    const currentDraftIdError = form.getFieldState(draftIdFieldPath).error?.message;
    if (
      currentDraftIdError === DRAFT_ID_CONFLICT_MESSAGE ||
      currentDraftIdError === draftIdConflictFieldMessage
    ) {
      form.clearErrors(draftIdFieldPath);
    }

    setDraftSaveStatus((currentStatus) => {
      if (currentStatus?.message !== DRAFT_ID_CONFLICT_MESSAGE) {
        return currentStatus;
      }

      return hasRealChanges
        ? {
            variant: "dirty",
            message: "Unsaved changes",
          }
        : null;
    });

    if (hasActiveDraftConflictBanner()) {
      dismissBanner();
    }
  }, [draftIdConflictFieldMessage, form, hasActiveDraftConflictBanner, hasRealChanges, idPath]);

  const revalidateActiveDraftIdConflict = useCallback(async () => {
    if (!isDraftMode) return;
    if (draftConflictRevalidationInFlightRef.current) return;

    const normalizedId = watchedDraftId || draftId || "";
    if (!normalizedId) return;

    const shouldCheckForResolvedConflict = Boolean(
      isDraftIdConflictActive || hasActiveDraftConflictBanner(),
    );

    if (!shouldCheckForResolvedConflict) return;

    draftConflictRevalidationInFlightRef.current = true;
    try {
      const conflictStillExists = await itemExists(normalizedId, {
        includeDrafts: true,
        allowDraftId: draftId ?? undefined,
      });

      if (!conflictStillExists) {
        clearDraftIdConflictUI();
      }
    } finally {
      draftConflictRevalidationInFlightRef.current = false;
    }
  }, [
    clearDraftIdConflictUI,
    draftId,
    hasActiveDraftConflictBanner,
    isDraftIdConflictActive,
    isDraftMode,
    watchedDraftId,
  ]);

  useEffect(() => {
    if (!isDraftMode) return;
    if (!isDraftIdConflictActive && !hasActiveDraftConflictBanner()) return;

    if (draftConflictRevalidationTimeoutRef.current) {
      window.clearTimeout(draftConflictRevalidationTimeoutRef.current);
    }

    draftConflictRevalidationTimeoutRef.current = window.setTimeout(() => {
      void revalidateActiveDraftIdConflict();
    }, 300);

    return () => {
      if (draftConflictRevalidationTimeoutRef.current) {
        window.clearTimeout(draftConflictRevalidationTimeoutRef.current);
      }
    };
  }, [
    hasActiveDraftConflictBanner,
    isDraftIdConflictActive,
    isDraftMode,
    revalidateActiveDraftIdConflict,
  ]);

  useEffect(() => {
    if (!isDraftMode) return;

    const handleFocus = () => {
      void revalidateActiveDraftIdConflict();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void revalidateActiveDraftIdConflict();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isDraftMode, revalidateActiveDraftIdConflict]);

  useNavigationPrompt({
    shouldBlock: hasRealChanges && !form.formState.isSubmitting,
    prompt: promptOnLeavingForm,
    shouldSkipBlockingRef: skipNavigationPromptRef,
  });

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (form.formState.isDirty && !form.formState.isSubmitting) {
        e.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [form.formState.isDirty, form.formState.isSubmitting]);

  useEffect(() => {
    if (typeof window.gtag == "function") {
      const submissionType = mapSubmissionTypeBasedOnActionFormTitle(title);
      sendGAEvent("submit_page_open", { submission_type: submissionType ? submissionType : title });
    }
  }, [title]);

  const { mutateAsync } = useMutation({
    mutationFn: (formData: z.TypeOf<Schema>) =>
      API.post("os", "/submit", {
        body: formData,
      }),
  });

  const { mutateAsync: saveDraftAsync, isLoading: isSavingDraft } = useMutation({
    mutationFn: (payload: Parameters<typeof saveDraft>[0]) => saveDraft(payload),
  });

  const showDraftIdConflict = useCallback(
    (conflictingId: string) => {
      const normalizedConflictId = conflictingId.trim().toUpperCase();
      const draftIdFieldPath = idPath as FieldPath<z.TypeOf<Schema>>;

      setDraftIdConflict(normalizedConflictId);
      form.setError(draftIdFieldPath, {
        type: "manual",
        message: draftIdConflictFieldMessage,
      });
      banner({
        header: "Unable to save package",
        body: DRAFT_ID_CONFLICT_MESSAGE,
        variant: "destructive",
        pathnameToDisplayOn: window.location.pathname,
      });
      setDraftSaveStatus({
        variant: "error",
        message: DRAFT_ID_CONFLICT_MESSAGE,
      });
      if (typeof window.scrollTo === "function") {
        window.scrollTo(0, 0);
      }
    },
    [draftIdConflictFieldMessage, form, idPath],
  );

  const validateDraftIdAvailability = useCallback(
    async (rawId: string) => {
      const normalizedId = rawId.trim().toUpperCase();
      if (!normalizedId) return false;

      const exists = await itemExists(normalizedId, {
        includeDrafts: true,
        allowDraftId: draftId ?? undefined,
      });

      if (!isMountedRef.current) {
        return false;
      }

      if (exists) {
        showDraftIdConflict(normalizedId);
        return false;
      }

      setDraftIdConflict(null);
      return true;
    },
    [draftId, showDraftIdConflict],
  );

  const getResolvedDraftId = useCallback(
    (formValues: Record<string, unknown>) => {
      const idValue = getValueByPath(formValues, idPath);
      const idFromForm = typeof idValue === "string" ? idValue.trim() : "";
      const fallbackDraftId = isDraftMode ? draftId : undefined;
      return idFromForm || fallbackDraftId || "";
    },
    [draftId, idPath, isDraftMode],
  );

  const onSubmit = form.handleSubmit(async (formData) => {
    if (!canProceedWithNonOwnerDraftAction(onSubmit)) {
      return;
    }

    try {
      if (draftEnabled) {
        const resolvedId = getResolvedDraftId(formData as Record<string, unknown>);
        if (!resolvedId || !(await validateDraftIdAvailability(resolvedId))) {
          return;
        }
      }

      if (isDraftMode) {
        setIsDraftSubmissionInProgress(true);
      }

      try {
        await mutateAsync(formData);
        if (!isMountedRef.current) return;
      } catch (error) {
        if (isDraftMode) {
          setIsDraftSubmissionInProgress(false);
        }

        if (draftEnabled && error?.response?.status === 409) {
          const resolvedId = getResolvedDraftId(formData as Record<string, unknown>);
          showDraftIdConflict(resolvedId || draftId || id || "");
          return;
        }

        if (error?.response?.status === 413) {
          throw Error(
            "Upload failed: Your submission is too large. Try uploading fewer files at a time or shortening long file names.",
          );
        }

        throw Error(`Error submitting form: ${error?.message || error}`);
      }

      const { documentChecker, property } = documentPollerArgs;
      const effectiveDocumentChecker = isDraftMode
        ? (check: Parameters<typeof documentChecker>[0]) =>
            documentChecker(check) && !check.hasStatus(SEATOOL_STATUS.DRAFT)
        : documentChecker;

      const documentPollerId =
        typeof property === "function" ? property(formData) : formData[property];

      try {
        const poller = documentPoller(documentPollerId, effectiveDocumentChecker, {
          includeDraft: isDraftMode,
        });
        await poller.startPollingData();
        if (!isMountedRef.current) return;
      } catch (error) {
        throw Error(`${error?.message || error}`);
      }

      const formOrigins = getFormOrigin({ authority, id });

      banner({
        ...bannerPostSubmission,
        pathnameToDisplayOn: formOrigins.pathname,
      });

      const timeOnPageSec = (Date.now() - startTimePage) / 1000;

      sendGAEvent("submission_submit_click", { package_type: formData.event, package_id: id });
      sendGAEvent("submit_page_exit", {
        submission_type: formData.event,
        time_on_page_sec: timeOnPageSec,
      });
      if (formData.event == "upload-subsequent-documents") {
        sendGAEvent("upload-subsequent-documents", { package_id: id });
      } else if (formData.event == "withdraw-package") {
        sendGAEvent("withdraw-package", { package_id: id });
      }

      if (isDraftMode) {
        skipNavigationPromptRef.current = true;
        navigate(formOrigins);
        void queryClient.invalidateQueries({ queryKey: ["record"] });
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ["record"] });
      if (!isMountedRef.current) return;
      navigate(formOrigins);
    } catch (error) {
      if (!isMountedRef.current) return;
      if (isDraftMode) {
        setIsDraftSubmissionInProgress(false);
      }
      console.error(error);
      banner({
        header: "An unexpected error has occurred:",
        body: error instanceof Error ? error.message : String(error),
        variant: "destructive",
        pathnameToDisplayOn: window.location.pathname,
      });
      window.scrollTo(0, 0);
    }
  });

  const handleSaveDraft = async () => {
    if (!draftEnabled || !draftOptions?.event) return;
    if (saveDraftInFlightRef.current) return;
    if (!canProceedWithNonOwnerDraftAction(handleSaveDraft)) return;

    setDraftSaveStatus({
      variant: "saving",
      message: "Saving...",
    });
    saveDraftInFlightRef.current = true;
    try {
      const failDraftSave = (message: string) => {
        if (!isMountedRef.current) return;
        banner({
          header: "Unable to save package",
          body: message,
          variant: "destructive",
          pathnameToDisplayOn: window.location.pathname,
        });
        setDraftSaveStatus({
          variant: "error",
          message,
        });
      };
      const formValues = form.getValues();
      const resolvedId = getResolvedDraftId(formValues as Record<string, unknown>);

      if (!resolvedId) {
        failDraftSave("Please enter a valid ID before saving.");
        return;
      }

      if (!(await validateDraftIdAvailability(resolvedId))) {
        return;
      }
      if (!isMountedRef.current) return;

      const isIdValid = await form.trigger(idPath as FieldPath<z.TypeOf<Schema>>);
      if (!isMountedRef.current) return;

      if (!isIdValid) {
        failDraftSave("Please enter a valid ID before saving.");
        return;
      }

      for (const requiredSaveField of draftOptions.requiredSaveFields ?? []) {
        const requiredValue = getValueByPath(
          formValues as Record<string, unknown>,
          requiredSaveField.path,
        );
        const hasRequiredValue =
          typeof requiredValue === "string" ? requiredValue.trim().length > 0 : !!requiredValue;

        if (hasRequiredValue) {
          continue;
        }

        await form.trigger(requiredSaveField.path as FieldPath<z.TypeOf<Schema>>);
        if (!isMountedRef.current) return;
        failDraftSave(requiredSaveField.message);
        return;
      }

      const normalizedId = resolvedId.toUpperCase();
      const authorityPath = draftOptions.authorityPath ?? "authority";
      const authorityValue = getValueByPath(formValues as Record<string, unknown>, authorityPath);
      const draftVersionPayload =
        isDraftMode &&
        typeof draftVersionRef.current.seqNo === "number" &&
        typeof draftVersionRef.current.primaryTerm === "number"
          ? {
              ifSeqNo: draftVersionRef.current.seqNo,
              ifPrimaryTerm: draftVersionRef.current.primaryTerm,
            }
          : {};

      const saveResponse = await saveDraftAsync({
        id: normalizedId,
        originalDraftId: draftId ?? undefined,
        event: draftOptions.event,
        authority: typeof authorityValue === "string" ? authorityValue : undefined,
        draftData: formValues as Record<string, unknown>,
        ...draftVersionPayload,
      });
      if (!isMountedRef.current) return;

      if (
        typeof saveResponse?.seqNo === "number" &&
        typeof saveResponse?.primaryTerm === "number"
      ) {
        draftVersionRef.current = {
          seqNo: saveResponse.seqNo,
          primaryTerm: saveResponse.primaryTerm,
        };
      }

      const didDraftIdChange = !rawDraftId || rawDraftId.toUpperCase() !== normalizedId;

      if (draftId && draftId !== normalizedId) {
        pendingDraftIdRemovalRef.current = draftId;
      }

      if (!isMountedRef.current) return;

      banner({
        header: "Progress saved",
        body: `Changes made to ${normalizedId} have been saved.`,
        variant: "success",
        pathnameToDisplayOn: window.location.pathname,
      });

      setDraftSaveStatus({
        variant: "success",
        message: `Progress saved at ${new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }).format(new Date())}`,
      });

      setCurrentSessionDraftActor({
        email: userObj?.email,
        name: userObj?.fullName,
      });

      form.reset(formValues);

      if (didDraftIdChange) {
        const nextSearch = new URLSearchParams(search);
        nextSearch.set("draftId", normalizedId);

        skipNavigationPromptRef.current = true;
        const routeTransition = startDraftSaveRouteTransition(normalizedId, pathname);
        draftRouteTransitionRef.current = routeTransition;
        setDraftRouteTransition(routeTransition);

        navigate(`${pathname}?${nextSearch.toString()}`, { replace: true });
      }

      void queryClient.invalidateQueries({ queryKey: ["record", normalizedId] });
    } catch (error) {
      if (!isMountedRef.current) return;
      const errorMessage = (() => {
        if (error?.response?.status === 409) {
          return DRAFT_ID_CONFLICT_MESSAGE;
        }

        const message =
          (error?.response?.data?.message as string | undefined) ??
          (error instanceof Error ? error.message : String(error));

        if (/already exists/i.test(message)) {
          return DRAFT_ID_CONFLICT_MESSAGE;
        }

        return error instanceof Error ? error.message : "Unable to save. Try again.";
      })();
      const isDraftConflictError = errorMessage === DRAFT_ID_CONFLICT_MESSAGE;

      if (isDraftConflictError) {
        const formValues = form.getValues();
        const resolvedId = getResolvedDraftId(formValues as Record<string, unknown>);
        showDraftIdConflict(resolvedId.toUpperCase());
      } else {
        banner({
          header: "Unable to save package",
          body: errorMessage,
          variant: "destructive",
          pathnameToDisplayOn: window.location.pathname,
        });
      }
      setDraftSaveStatus({
        variant: "error",
        message: errorMessage,
      });
    } finally {
      saveDraftInFlightRef.current = false;
    }
  };

  const draftSaveStatusClassName = (() => {
    switch (draftSaveStatus?.variant) {
      case "success":
        return "text-green-700";
      case "error":
        return "text-red-700";
      case "dirty":
        return "text-amber-700";
      default:
        return "text-gray-700";
    }
  })();

  const attachmentsFromSchema = useMemo(() => getAttachments(schema), [schema]);

  const handleCancel = (promptOverride?: Partial<Omit<UserPrompt, "onAccept">>) => {
    userPrompt({
      ...promptOnLeavingForm,
      ...promptOverride,
      onAccept: () => {
        skipNavigationPromptRef.current = true;
        const origin = getFormOrigin({ id, authority });
        navigate(origin);
      },
    });

    const timeOnPageSec = (Date.now() - startTimePage) / 1000;
    sendGAEvent("submit_cancel", {
      submission_type: title,
      time_on_page_sec: timeOnPageSec,
    });
  };

  useEffect(() => {
    if (!isStickyFooterEnabled || !footerTriggerElement) {
      setIsFooterFixed(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterFixed(!entry.isIntersecting);
      },
      { threshold: 0 },
    );

    observer.observe(footerTriggerElement);
    return () => observer.disconnect();
  }, [footerTriggerElement, isStickyFooterEnabled]);

  const draftNotFoundError = Boolean(draftError && isNotFoundApiError(draftError));
  const draftRecordIsInactive =
    isDraftFetched &&
    !draftError &&
    (!draftRecord ||
      draftRecord._source?.deleted === true ||
      draftRecord._source?.seatoolStatus !== SEATOOL_STATUS.DRAFT);
  const shouldRedirectFromInactiveDraft =
    isDraftMode && !isDraftSaveRouteTransition && (draftNotFoundError || draftRecordIsInactive);

  useEffect(() => {
    if (!shouldRedirectFromInactiveDraft || hasRedirectedFromInactiveDraftRef.current) {
      return;
    }

    hasRedirectedFromInactiveDraftRef.current = true;
    skipNavigationPromptRef.current = true;

    if (draftId) {
      queryClient.removeQueries({
        queryKey: ["record", draftId, "preferDraft"],
        exact: true,
      });
    }

    navigate("/dashboard", { replace: true });
  }, [draftId, navigate, shouldRedirectFromInactiveDraft]);

  if (isUserLoading === true) {
    return <LoadingSpinner />;
  }

  if (
    isDraftMode &&
    (isDraftSubmissionInProgress ||
      form.formState.isSubmitting ||
      (isDraftLoading && !isDraftSaveRouteTransition))
  ) {
    return <LoadingSpinner />;
  }

  if (shouldRedirectFromInactiveDraft) {
    return <LoadingSpinner />;
  }

  if (isDraftMode && !isDraftSaveRouteTransition && draftError && !draftNotFoundError) {
    return (
      <SimplePageContainer>
        <ErrorAlert error={draftError as ReactQueryApiError} />
      </SimplePageContainer>
    );
  }

  const doesUserHaveAccessToForm = conditionsDeterminingUserAccess.some((condition) =>
    condition(userObj || null),
  );

  if (!userObj || doesUserHaveAccessToForm === false) {
    return <Navigate to="/" replace />;
  }

  return (
    <SimplePageContainer>
      <BreadCrumbs
        options={[
          ...breadcrumbs,
          {
            to: pathname,
            displayText: breadcrumbText,
            order: breadcrumbs.length,
          },
        ]}
      />
      {form.formState.isSubmitting && <LoadingSpinner />}
      <Form {...form}>
        <form onSubmit={onSubmit} className="my-6 space-y-8 mx-auto justify-center flex flex-col">
          <fieldset className="space-y-8">
            <legend className="sr-only">{title}</legend>
            <SectionCard testId="detail-section" title={title}>
              <div>
                {areFieldsRequired && <RequiredFieldDescription />}
                <ActionFormDescription boldReminder={areFieldsRequired}>
                  {formDescription}
                </ActionFormDescription>
              </div>
              <Fields {...form} isDraftMode={isDraftMode} />
            </SectionCard>
            {attachmentsFromSchema.length > 0 && (
              <ActionFormAttachments
                attachmentsFromSchema={attachmentsFromSchema}
                {...attachments}
                type={title}
              />
            )}
            {additionalInformation && (
              <SectionCard
                testId="additional-info"
                title={
                  <>
                    {additionalInformation.title}{" "}
                    {additionalInformation.required && <RequiredIndicator />}
                  </>
                }
              >
                <FormField
                  control={form.control}
                  name={"additionalInformation" as FieldPath<z.TypeOf<Schema>>}
                  render={({ field }) => (
                    <AdditionalInformation
                      label={additionalInformation.label}
                      field={field}
                      submissionTitle={title}
                    />
                  )}
                />
              </SectionCard>
            )}
            {showPreSubmissionMessage && (
              <PreSubmissionMessage
                hasProgressLossReminder={areFieldsRequired}
                preSubmissionMessage={preSubmissionMessage}
              />
            )}
          </fieldset>
          {Footer ? (
            <Footer
              form={form}
              onSubmit={onSubmit}
              onCancel={handleCancel}
              onSaveDraft={draftEnabled ? handleSaveDraft : undefined}
              isDraftMode={isDraftMode}
            />
          ) : isStickyFooterEnabled ? (
            <section>
              <div ref={setFooterTriggerElement} className="h-px" aria-hidden />
              <section
                className={
                  isFooterFixed
                    ? "fixed bottom-0 left-0 w-full z-40 border-t border-gray-300 bg-white px-6"
                    : "flex flex-col md:flex-row justify-between items-center gap-4 p-4 w-full"
                }
                data-testid="action-form-footer"
              >
                <div className="flex justify-between items-center w-full py-3">
                  <Button
                    onClick={() => handleCancel()}
                    data-testid="cancel-action-form"
                    className="px-6"
                    variant="link"
                    type="button"
                  >
                    Cancel
                  </Button>

                  <div className="flex items-center gap-4">
                    {draftEnabled && draftSaveStatus?.message && (
                      <p
                        ref={draftSaveStatusRef}
                        className={`text-sm font-medium ${draftSaveStatusClassName}`}
                        data-testid="draft-save-status"
                        role="status"
                        aria-live="polite"
                        tabIndex={-1}
                      >
                        {draftSaveStatus.message}
                      </p>
                    )}
                    {draftEnabled && (
                      <Button
                        type="button"
                        className="px-12"
                        variant="outline"
                        onClick={handleSaveDraft}
                        disabled={isSavingDraft || isDraftIdConflictActive}
                        data-testid="save-draft-form"
                      >
                        Save
                      </Button>
                    )}
                    <Button
                      type={promptPreSubmission ? "button" : "submit"}
                      onClick={
                        promptPreSubmission
                          ? () => userPrompt({ ...promptPreSubmission, onAccept: onSubmit })
                          : undefined
                      }
                      disabled={!form.formState.isValid || isDraftIdConflictActive}
                      data-testid="submit-action-form"
                      className="px-12"
                    >
                      {effectiveSubmitButtonLabel}
                    </Button>
                  </div>
                </div>
              </section>
            </section>
          ) : (
            <section
              className={
                draftEnabled ? "flex items-center gap-2 p-4" : "flex justify-end gap-2 p-4 ml-auto"
              }
            >
              {draftEnabled && draftSaveStatus?.message && (
                <p
                  ref={draftSaveStatusRef}
                  className={`mr-auto text-sm font-medium ${draftSaveStatusClassName}`}
                  data-testid="draft-save-status"
                  role="status"
                  aria-live="polite"
                  tabIndex={-1}
                >
                  {draftSaveStatus.message}
                </p>
              )}
              {draftEnabled && (
                <Button
                  className="px-12"
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isSavingDraft || isDraftIdConflictActive}
                  data-testid="save-draft-form"
                >
                  Save
                </Button>
              )}
              <Button
                className="px-12"
                type={promptPreSubmission ? "button" : "submit"}
                onClick={
                  promptPreSubmission
                    ? () => userPrompt({ ...promptPreSubmission, onAccept: onSubmit })
                    : undefined
                }
                disabled={!form.formState.isValid || isDraftIdConflictActive}
                data-testid="submit-action-form"
              >
                {effectiveSubmitButtonLabel}
              </Button>
              <Button
                className="px-12"
                onClick={() => handleCancel()}
                variant="outline"
                type="reset"
                data-testid="cancel-action-form"
              >
                Cancel
              </Button>
            </section>
          )}
        </form>
      </Form>
      {showFAQFooter && <FAQFooter />}
    </SimplePageContainer>
  );
};
