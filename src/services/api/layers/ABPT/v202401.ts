import { FormSchema } from "shared-types";

const ABPT: FormSchema = {
  header: "ABP Test Form",
  sections: [
    {
      title: "Table Group Showcase",
      form: [
        {
          slots: [
            {
              name: "test2",
              rhf: "TableGroup",
              label: "Test Table scalable",
              description: "Test Table with an actual scalable state",
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

export const form = ABPT;
