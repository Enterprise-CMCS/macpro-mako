import { FormSchema } from "shared-types";

export const v202401: FormSchema = {
  header: "ABP Test Form",
  sections: [
    {
      title: "Table Group Showcase",
      form: [
        {
          slots: [
            {
              rhf: "TextDisplay",
              name: "sampleStyleBlock",
              text: [
                "This is an example styled text field.",
                { text: "Here we showcase bolding, ", type: "bold" },
                {
                  text: "a link (dashboard), ",
                  type: "link",
                  link: "/dashboard",
                },
                {
                  text: "full custom styling, ",
                  classname: "text-xs text-red-400",
                },
                { text: "italic sections, ", type: "italic" },
                { text: "as well as:" },
                { text: "text with line breaks 1", type: "br" },
                { text: "text with line breaks 2", type: "br" },
                { text: "text with line breaks 3", type: "brWrap" },
                "Final chunk to ensure long text continues after all of these styles; Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
              ],
            },
            {
              rhf: "Checkbox",
              name: "sampleCheckboxField",
              props: {
                options: [
                  {
                    label: "sampleStyledCheckboxLabel",
                    value: "Samp1",
                    styledLabel: [
                      "This is an example styled text field, but using a checkbox field to determine label interaction with new comp.",
                      { text: "Here we showcase bolding, ", type: "bold" },
                      {
                        text: "a link (dashboard), ",
                        type: "link",
                        link: "/dashboard",
                      },
                      {
                        text: "full custom styling, ",
                        classname: "text-xs text-red-400",
                      },
                      { text: "italic sections, ", type: "italic" },
                      { text: "as well as:" },
                      { text: "text with line breaks 1", type: "br" },
                      { text: "text with line breaks 2", type: "br" },
                      { text: "text with line breaks 3", type: "brWrap" },
                      "Final chunk to ensure long text continues after all of these styles; Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                    ],
                  },
                  {
                    label: "Simple Label Followup To Check Styling",
                    value: "Samp2",
                  },
                ],
              },
            },
            {
              rhf: "Radio",
              name: "sampleRadioField",
              props: {
                options: [
                  {
                    label: "sampleStyledRadioLabel",
                    value: "Samp1",
                    styledLabel: [
                      "This is an example styled text field, but using a radio button field to determine label interaction with new comp.",
                      { text: "Here we showcase bolding, ", type: "bold" },
                      {
                        text: "a link (dashboard), ",
                        type: "link",
                        link: "/dashboard",
                      },
                      {
                        text: "full custom styling, ",
                        classname: "text-xs text-red-400",
                      },
                      { text: "italic sections, ", type: "italic" },
                      { text: "as well as:" },
                      { text: "text with line breaks 1", type: "br" },
                      { text: "text with line breaks 2", type: "br" },
                      { text: "text with line breaks 3", type: "brWrap" },
                      "Final chunk to ensure long text continues after all of these styles; Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                    ],
                  },
                  {
                    label: "Simple Label Followup To Check Styling",
                    value: "Samp2",
                  },
                ],
              },
            },
            {
              name: "test2",
              rhf: "TableGroup",
              label: "Test Table scalable",
              labelStyling: "font-bold",
              description: [
                "Test Table with an actual scalable state, with an example ",
                { type: "link", text: "link (dashboard)", link: "/dashboard" },
              ],
              descriptionAbove: true,
              fields: [
                {
                  name: "test21",
                  rhf: "Input",
                  label: "Labelerino 1",
                  tbColumnStyle: "w-20",
                },
                {
                  name: "test22",
                  rhf: "TextDisplay",
                  label: "Labelerino 2",
                  text: "Sample text display",
                },
                {
                  name: "test23",
                  rhf: "Input",
                  label: "Labelerino 3",
                  tbColumnStyle: "w-42",
                },
              ],
            },
            {
              name: "test",
              rhf: "TableGroup",
              label: "Test Table",
              labelStyling: "font-bold",
              description: "Test Table Component description",
              props: {
                scalable: false,
                initNumRows: 5,
              },
              descriptionAbove: true,
              fields: [
                {
                  name: "test1",
                  rhf: "Input",
                  label: "Labelerino with super looooooooooong text 1",
                  rules: {
                    required: "* Labelerino 1 Required",
                    max: {
                      value: "4",
                      message: "* Label 1 cannot be more than a value of 4",
                    },
                  },
                },
                {
                  name: "test2",
                  rhf: "Select",
                  props: {
                    options: [
                      { label: "test12", value: "sdfsddddf" },
                      {
                        label:
                          "testasdsdsd sdfsdfs sss sd  ddd d ddd dfsdffsfdfs s s s s fdfds12",
                        value: "sdfsdaf",
                      },
                      {
                        label: "testasdf asdfasdfas dfasdfasdfasdf12",
                        value: "sdfsasdasdf",
                      },
                      { label: "test12", value: "sdfdasaasdf" },
                      { label: "test12", value: "sdfasdaddsasdf" },
                    ],
                  },
                  label: "(Label 2) Income Less Than or Equal to",
                },
                {
                  name: "test3",
                  rhf: "Input",
                  label: "Labelerino 3",
                },
                {
                  name: "test4",
                  rhf: "Input",
                  label: "Labelerino 4",
                },
                {
                  name: "test5",
                  rhf: "Input",
                  label: "Labelerino 5",
                },
                {
                  name: "test6",
                  rules: { required: "* Labelerino 37 Required" },
                  rhf: "Input",
                  label: "Labelerino 6",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
