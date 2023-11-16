import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../Dialog";
import { Button } from "../Inputs";

type Props = {
  open: boolean;
  description?: React.ReactNode;
  body?: React.ReactNode;
  title: React.ReactNode;
  onCancel: () => void;
  onAccept: () => void;
  cancelButtonText?: string;
  acceptButtonText?: string;
  cancelButtonVisible?: boolean;
  acceptButtonVisible?: boolean;
};

export function Modal({
  open,
  description,
  title,
  body,
  onAccept,
  onCancel,
  acceptButtonText = "Confirm",
  cancelButtonText = "Cancel",
  acceptButtonVisible = true,
  cancelButtonVisible = true,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {body && <div className="grid gap-4 py-4">{body}</div>}
        <DialogFooter>
          {cancelButtonVisible && (
            <Button type="button" variant={"outline"} onClick={onCancel}>
              {cancelButtonText}
            </Button>
          )}
          {acceptButtonVisible && (
            <Button type="submit" onClick={onAccept}>
              {acceptButtonText}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
