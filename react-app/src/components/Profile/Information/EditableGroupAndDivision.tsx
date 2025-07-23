import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "aws-amplify";
import { LucidePencil } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
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
import { divisionsType, groupDivision } from "@/features/sign-up/groupDivision";

const groupDivisionSchema = z.object({
  group: z.string().min(1, "A group selection is required."),
  division: z.string().min(1, "A division selection is required."),
});

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
    const initialGroupObject = group ? groupDivision.find((g) => g.abbr === group) : undefined;
    return {
      initialGroupAbbr: initialGroupObject?.abbr || "",
      initialDivisionAbbr:
        initialGroupObject && division
          ? initialGroupObject.divisions.find((d) => d.abbr === division)?.abbr || ""
          : "",
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

  const isButtonDisabled = !selectedGroup || !selectedDivision;

  return (
    <DialogContent onEscapeKeyDown={handleEscapeKeyDown}>
      <DialogHeader>
        <DialogTitle>Select your Group and Division</DialogTitle>
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
                    <SelectTrigger>
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
                    <SelectTrigger>
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
  const [formKey, setFormKey] = useState(0);
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userDetails"] });
      setIsDialogOpen(false);
    },
  });

  const handleOpenDialog = () => {
    setFormKey((prevKey) => prevKey + 1);
    setIsDialogOpen(true);
  };

  const handleSubmit = (formData: z.infer<typeof groupDivisionSchema>) => {
    submitGroupDivision(formData);
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
  };

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
        {group || "N/A"}/{division || "N/A"}
      </p>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <GroupAndDivisionForm
          key={formKey}
          group={group}
          division={division}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </Dialog>
    </div>
  );
};
