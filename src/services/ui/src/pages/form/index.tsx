import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Button,
  Calendar,
  Checkbox,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
} from "@/components/Inputs";
import { Link } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/Popover";
import { cn } from "@/lib";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  FormSection,
  RHFFormGroup,
  RHFInput,
  RHFSlot,
  RHFSlotGroup,
} from "@/components/RHF/RHFInput";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/Accordion";
import { ABP1 } from "./proto";

const items = [
  {
    id: "recents",
    label: "Recents",
  },
  {
    id: "home",
    label: "Home",
  },
  {
    id: "applications",
    label: "Applications",
  },
  {
    id: "desktop",
    label: "Desktop",
  },
  {
    id: "downloads",
    label: "Downloads",
  },
  {
    id: "documents",
    label: "Documents",
  },
] as const;

const FormSchema = z.object({
  alt_benefit_plan_population_name: z.string().min(2, {
    message: "must be at least 2 characters.",
  }),
  eligibility_groups: z.array(
    z.object({
      eligibility_group: z.string(),
      mandatory_voluntary: z.enum(["mandatory", "voluntary"]),
    })
  ),
  is_enrollment_available: z.enum(["yes", "no"]),
  target_criteria: z.array(z.string()),
  income_target: z.string(),
  income_definition: z.string(),
  income_definition_specific: z.string(),
  income_definition_specific_statewide: z.array(
    z.object({
      household_size: z.string(),
      standard: z.number(),
    })
  ),
  is_incremental_amount: z.boolean(),
  dollar_incremental_amount: z.string(),
  // username: z.string().min(2, {
  //   message: "Username must be at least 2 characters.",
  // }),
  // email: z
  //   .string({
  //     required_error: "Please select an email to display.",
  //   })
  //   .email(),
  // bio: z
  //   .string()
  //   .min(10, {
  //     message: "Bio must be at least 10 characters.",
  //   })
  //   .max(160, {
  //     message: "Bio must not be longer than 30 characters.",
  //   }),
  // marketing_emails: z.boolean().default(false).optional(),
  // security_emails: z.boolean(),
  // type: z.enum(["all", "mentions", "none"], {
  //   required_error: "You need to select a notification type.",
  // }),
  // dob: z.date({
  //   required_error: "A date of birth is required.",
  // }),
  // items: z.array(z.string()).refine((value) => value.some((item) => item), {
  //   message: "You have to select at least one item.",
  // }),
});

export function ExampleForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      alt_benefit_plan_population_name: "",
      eligibility_groups: [],
      is_enrollment_available: "no",
      target_criteria: [],
      income_target: "",
      income_definition: "",
      income_definition_specific: "",
      income_definition_specific_statewide: [],
      is_incremental_amount: false,
      dollar_incremental_amount: "",
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    console.log(data);
  });

  return (
    <div className="max-w-screen-xl mx-auto p-4 lg:px-8">
      <Form {...form}>
        <form onSubmit={onSubmit} className="w-2/3 space-y-6">
          <Accordion type="multiple" className="w-auto">
            {ABP1.sections.map((SEC) => (
              <AccordionItem value="sd" defaultChecked key={SEC.title}>
                <AccordionTrigger className="bg-primary p-4 w-full text-white text-xl">
                  {SEC.title}
                </AccordionTrigger>

                <AccordionContent>
                  {SEC.form.map((GP) => {
                    return (
                      <RHFFormGroup
                        key={GP.description}
                        control={form.control}
                        form={GP}
                      />
                    );
                  })}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          {/* <RHFSlotGroup control={form.control} /> */}
          {/* <FormField
            control={form.control}
            name="username"
            render={RHFSlot({
              RHF: "Input",
              label: "Username",
              placeholder: "jimmy something",
              description: "This is your public display name.",
            })}
          />
          <FormField
            control={form.control}
            name="bio"
            render={RHFSlot({
              RHF: "Textarea",
              label: "Bio",
              placeholder: "Tell us a little bit about yourself",
              className: "resize-none",
              description: (
                <>
                  You can <span>@mention</span> other users and organizations.
                </>
              ),
            })}
          />

          <FormField
            control={form.control}
            name="marketing_emails"
            render={RHFSlot({
              RHF: "Switch",
              label: "Marketing emails",
              placeholder: "Tell us a little bit about yourself",
              className: "resize-none",
              description: (
                <>
                  You can <span>@mention</span> other users and organizations.
                </>
              ),
            })}
          />
          <FormField
            control={form.control}
            name="security_emails"
            render={RHFSlot({
              RHF: "Switch",
              label: "Security emails",
              placeholder: "Tell us a little bit about yourself",
              className: "resize-none",
              description: (
                <>
                  You can <span>@mention</span> other users and organizations.
                </>
              ),
            })}
          />
          <FormField
            control={form.control}
            name="email"
            render={RHFSlot({
              RHF: "Select",
              label: "Email",
              options: [
                { label: "m@example.com", value: "m@example.com" },
                { label: "m@google.com", value: "m@google.com" },
                { label: "m@support.com", value: "m@support.com" },
              ],
            })}
          />
          <FormField
            control={form.control}
            name="type"
            render={RHFSlot({
              RHF: "Radio",
              label: "Notify me about...",
              options: [
                { label: "All new messages", value: "all" },
                { label: "Direct messages and mentions", value: "mentions" },
                { label: "Nothing", value: "nothing" },
              ],
            })}
          />
          <FormField
            control={form.control}
            name="dob"
            render={RHFSlot({
              RHF: "DatePicker",
              label: "Date of birth",
              mode: "single",
              initialFocus: true,
              disabled: (date) =>
                date > new Date() || date < new Date("1900-01-01"),
            })}
          />
          <FormField
            control={form.control}
            name="items"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="text-base">Sidebar</FormLabel>
                  <FormDescription>
                    Select the items you want to display in the sidebar.
                  </FormDescription>
                </div>
                {items.map((item) => (
                  <FormField
                    key={item.id}
                    control={form.control}
                    name="items"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={item.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, item.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== item.id
                                      )
                                    );
                              }}
                              label=""
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            {item.label}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button> */}
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
}
