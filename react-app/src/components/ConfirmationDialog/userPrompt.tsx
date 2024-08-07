import { useEffect, useState } from "react";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";

export type UserPrompt = {
  header: string;
  body: string;
  cancelButtonText?: string;
  acceptButtonText?: string;
  areButtonsReversed?: boolean;
  onAccept: () => void;
  onCancel?: () => void;
};

class Observer {
  subscribers: Array<(userPrompt: UserPrompt) => void>;
  userPrompt: UserPrompt | null;

  constructor() {
    this.subscribers = [];
    this.userPrompt = null;
  }

  subscribe = (subscriber: (userPrompt: UserPrompt | null) => void) => {
    this.subscribers.push(subscriber);

    return () => {
      const index = this.subscribers.indexOf(subscriber);
      this.subscribers.splice(index, 1);
    };
  };

  private publish = (data: UserPrompt | null) => {
    this.subscribers.forEach((subscriber) => subscriber(data));
  };

  create = (data: UserPrompt) => {
    this.publish(data);
    this.userPrompt = { ...data };
  };

  dismiss = () => {
    this.publish(null);
    this.userPrompt = null;
  };
}

const userPromptState = new Observer();

export const userPrompt = (newUserPrompt: UserPrompt) => {
  return userPromptState.create(newUserPrompt);
};

export const UserPrompt = () => {
  const [activeUserPrompt, setActiveUserPrompt] = useState<UserPrompt | null>(
    null,
  );
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = userPromptState.subscribe((userPrompt) => {
      if (userPrompt) {
        setActiveUserPrompt(userPrompt);
        setIsOpen(true);
      } else {
        // artificial delay to prevent content from disappearing first
        setTimeout(() => setActiveUserPrompt(null), 100);
        setIsOpen(false);
      }
    });

    return unsubscribe;
  }, []);

  const onCancel = () => {
    if (activeUserPrompt) {
      if (activeUserPrompt.onCancel) {
        activeUserPrompt.onCancel();
      }
      userPromptState.dismiss();
    }
  };

  const onAccept = () => {
    if (activeUserPrompt) {
      activeUserPrompt.onAccept();
      userPromptState.dismiss();
    }
  };

  if (activeUserPrompt === null) {
    return null;
  }

  return (
    <ConfirmationDialog
      open={isOpen}
      title={activeUserPrompt.header}
      body={activeUserPrompt.body}
      onAccept={onAccept}
      onCancel={onCancel}
      cancelButtonText={activeUserPrompt.cancelButtonText}
      acceptButtonText={activeUserPrompt.acceptButtonText}
      areButtonsReversed={activeUserPrompt.areButtonsReversed}
    />
  );
};
