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

export const userPrompt = (newuserPrompt: UserPrompt) => {
  return userPromptState.create(newuserPrompt);
};

export const UserPrompt = () => {
  const [activeuserPrompt, setActiveuserPrompt] = useState<UserPrompt | null>(
    null,
  );
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = userPromptState.subscribe((userPrompt) => {
      if (userPrompt) {
        setActiveuserPrompt(userPrompt);
        setIsOpen(true);
      } else {
        // artificial delay to prevent content from disappearing first
        setTimeout(() => setActiveuserPrompt(null), 100);
        setIsOpen(false);
      }
    });

    return unsubscribe;
  }, []);

  const onCancel = () => {
    if (activeuserPrompt) {
      if (activeuserPrompt.onCancel) {
        activeuserPrompt.onCancel();
      }
      userPromptState.dismiss();
    }
  };

  const onAccept = () => {
    if (activeuserPrompt) {
      activeuserPrompt.onAccept();
      userPromptState.dismiss();
    }
  };

  if (activeuserPrompt === null) {
    return null;
  }

  return (
    <ConfirmationDialog
      open={isOpen}
      title={activeuserPrompt.header}
      body={activeuserPrompt.body}
      onAccept={onAccept}
      onCancel={onCancel}
      cancelButtonText={activeuserPrompt.cancelButtonText}
      acceptButtonText={activeuserPrompt.acceptButtonText}
      areButtonsReversed={activeuserPrompt.areButtonsReversed}
    />
  );
};
