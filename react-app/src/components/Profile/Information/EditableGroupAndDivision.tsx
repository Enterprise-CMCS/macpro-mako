import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { LucidePencil } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { UserDetails } from "shared-types";
import { z } from "zod";

import {
  Button,
  Dialog,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/Dialog";
import { BLANK_VALUE } from "@/consts";
import { divisionsType, groupDivision, groupDivisionType } from "@/features/sign-up/groupDivision";

const groupDivisionSchema = z.object({
  group: z.string().min(1, "A group selection is required."),
  division: z.string().min(1, "A division selection is required."),
});

const parseNumericId = (value?: string) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const id = Number(trimmed);
  return Number.isNaN(id) ? null : id;
};

const resolveGroup = (value?: string) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  console.log("resolveGroup", trimmed);
  const matchByLabel = groupDivision.find(
    (group) => group.abbr === trimmed || group.name === trimmed,
  );
  if (matchByLabel) return matchByLabel;
  console.log("no match by label, trying id");
  const id = parseNumericId(trimmed);
  console.log("parsed id", id);
  if (id === null) return undefined;
  console.log(groupDivision, "finding by id", id);
  return groupDivision.find((group) => group.id === id);
};

const resolveDivision = (value?: string, group?: groupDivisionType) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const id = parseNumericId(trimmed);
  const allDivisions = groupDivision.flatMap((group) => group.divisions);
  const divisionsToSearch = group ? group.divisions : allDivisions;

  const matchByLabelOrId = (division: divisionsType) =>
    division.abbr === trimmed || division.name === trimmed || (id !== null && division.id === id);

  return (
    divisionsToSearch.find(matchByLabelOrId) ??
    (group ? allDivisions.find(matchByLabelOrId) : undefined)
  );
};

const getGroupDisplayValue = (value?: string) => {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";

  const id = parseNumericId(trimmed);
  if (id === null) return trimmed;

  return groupDivision.find((group) => group.id === id)?.abbr ?? trimmed;
};

const getDivisionDisplayValue = (value?: string, groupValue?: string) => {
  console.log("getDivisionDisplayValue", value, groupValue);
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";

  const id = parseNumericId(trimmed);
  if (id === null) return trimmed;

  const division = resolveDivision(trimmed, resolveGroup(groupValue));
  console.log("resolved division", division);
  return division?.abbr ?? division?.name ?? trimmed;
};

type GroupAndDivisionFormProps = {
  group?: string;
  division?: string;
  onSubmit: (data: z.infer<typeof groupDivisionSchema>) => void;
  onCancel: () => void;
};

const GroupAndDivisionForm = ({
  group,
  division,
  onSubmit,
  onCancel,
}: GroupAndDivisionFormProps) => {
  const [isGroupSelectOpen, setIsGroupSelectOpen] = useState(false);
  const [isDivisionSelectOpen, setIsDivisionSelectOpen] = useState(false);
  const [availableDivisions, setAvailableDivisions] = useState<divisionsType[]>([]);

  const { initialGroupAbbr, initialDivisionAbbr } = useMemo(() => {
    const initialGroupObject = resolveGroup(group);
    const initialDivisionObject = resolveDivision(division, initialGroupObject);
    return {
      initialGroupAbbr: initialGroupObject?.abbr || "",
      initialDivisionAbbr: initialDivisionObject?.abbr || initialDivisionObject?.name || "",
    };
  }, [group, division]);

  const form = useForm<z.infer<typeof groupDivisionSchema>>({
    resolver: zodResolver(groupDivisionSchema),
    mode: "onChange",
    defaultValues: {
      group: initialGroupAbbr,
      division: initialDivisionAbbr,
    },
  });

  const selectedGroup = form.watch("group");
  const selectedDivision = form.watch("division");

  useEffect(() => {
    const groupData = groupDivision.find((g) => g.abbr === selectedGroup);
    setAvailableDivisions(groupData?.divisions ?? []);
  }, [selectedGroup]);

  const handleEscapeKeyDown = (event: KeyboardEvent) => {
    if ((isGroupSelectOpen || isDivisionSelectOpen) && event.key === "Escape") {
      event.preventDefault();
    }
  };

  const handleInteractOutside = (event: Event) => {
    if (isGroupSelectOpen || isDivisionSelectOpen) {
      event.preventDefault();
    }
  };

  const isButtonDisabled = !selectedGroup || !selectedDivision;

  return (
    <DialogContent onEscapeKeyDown={handleEscapeKeyDown} onInteractOutside={handleInteractOutside}>
      <DialogHeader>
        <DialogTitle>Select a Group and Division</DialogTitle>
      </DialogHeader>
      <DialogDescription className="sr-only">
        This form will collect the necessary details to edit your group and division. Please fill
        out all required fields.
      </DialogDescription>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="group"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">Group</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    form.setValue("division", "");
                  }}
                  value={field.value}
                  open={isGroupSelectOpen}
                  onOpenChange={setIsGroupSelectOpen}
                >
                  <FormControl>
                    <SelectTrigger data-testid="group-select">
                      <SelectValue placeholder="Select a group" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {groupDivision.map((group) => (
                      <SelectItem key={group.id} value={group.abbr}>
                        <div className="flex items-start gap-x-2">
                          <strong className="w-16 flex-shrink-0 text-left">{group.abbr}</strong>
                          <span>{group.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="division"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">Division</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  open={isDivisionSelectOpen}
                  onOpenChange={setIsDivisionSelectOpen}
                  disabled={!selectedGroup || availableDivisions.length === 0}
                >
                  <FormControl>
                    <SelectTrigger data-testid="division-select">
                      <SelectValue placeholder="Select a division" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableDivisions.map((division) => (
                      <SelectItem key={division.id} value={division.abbr || division.name}>
                        {division.abbr ? (
                          <div className="flex items-start gap-x-2">
                            <strong className="w-16 flex-shrink-0 text-left">
                              {division.abbr}
                            </strong>
                            <span>{division.name}</span>
                          </div>
                        ) : (
                          division.name
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter className="flex sm:justify-start">
            <Button type="submit" disabled={isButtonDisabled || form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Submitting..." : "Submit"}
            </Button>
            <Button type="button" variant="link" onClick={onCancel}>
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

type EditableGroupAndDivisionProps = {
  group?: string;
  division?: string;
  allowEdits?: boolean;
  email: string;
};

export const EditableGroupAndDivision = ({
  group,
  division,
  allowEdits,
  email,
}: EditableGroupAndDivisionProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  const { mutate: submitGroupDivision } = useMutation({
    mutationFn: (data: z.infer<typeof groupDivisionSchema>) => {
      return API.post("os", "/submitGroupDivision", {
        body: {
          userEmail: email,
          ...data,
        },
      });
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ["userDetails"] });
      const previousUserDetails = queryClient.getQueryData(["userDetails"]);

      if (previousUserDetails) {
        queryClient.setQueryData(["userDetails"], (old: UserDetails) => ({
          ...old,
          group: newData.group,
          division: newData.division,
        }));
      }

      return { previousUserDetails };
    },
    onSuccess: () => {
      setIsDialogOpen(false);
    },
    onError: (_err, _newData, context) => {
      if (context?.previousUserDetails) {
        queryClient.setQueryData(["userDetails"], context.previousUserDetails);
      }
      setIsDialogOpen(false);
    },
  });

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleSubmit = (formData: z.infer<typeof groupDivisionSchema>) => {
    submitGroupDivision(formData);
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
  };

  const displayGroup = useMemo(() => getGroupDisplayValue(group), [group]);
  const displayDivision = useMemo(
    () => getDivisionDisplayValue(division, group),
    [division, group],
  );

  return (
    <div className="leading-9">
      <h3 className="font-bold flex items-center">
        Group & Division{" "}
        {allowEdits && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleOpenDialog}
            aria-label="Edit Group and Division"
          >
            <LucidePencil className="w-5" />
          </Button>
        )}
      </h3>

      <p>
        {displayGroup && displayDivision
          ? `${displayGroup}/${displayDivision}`
          : `${BLANK_VALUE} ${BLANK_VALUE}`}
      </p>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <GroupAndDivisionForm
          key={String(isDialogOpen)}
          group={group}
          division={division}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </Dialog>
    </div>
  );
};
