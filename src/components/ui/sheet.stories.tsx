import type { Meta, StoryObj } from "@storybook/nextjs";
import { Button } from "./button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";

const meta: Meta<typeof Sheet> = {
  title: "Atoms/Sheet",
  component: Sheet,
};

export default meta;
type Story = StoryObj<typeof Sheet>;

function SheetDemo({ side }: { side?: "top" | "right" | "bottom" | "left" }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open</Button>
      </SheetTrigger>
      <SheetContent side={side}>
        <SheetHeader>
          <SheetTitle>Sheet title</SheetTitle>
          <SheetDescription>Sheet description goes here.</SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <Button>Save</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export const Right: Story = { render: () => <SheetDemo side="right" /> };
export const Left: Story = { render: () => <SheetDemo side="left" /> };
export const Top: Story = { render: () => <SheetDemo side="top" /> };
export const Bottom: Story = { render: () => <SheetDemo side="bottom" /> };

export const Playground: StoryObj<typeof SheetDemo> = {
  args: { side: "right" },
  argTypes: { side: { control: "select", options: ["top", "right", "bottom", "left"] } },
  render: (args) => <SheetDemo {...args} />,
};
