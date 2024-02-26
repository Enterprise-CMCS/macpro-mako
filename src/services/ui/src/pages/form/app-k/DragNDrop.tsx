import { cn } from "@/lib";
import React, { FC, PropsWithChildren } from "react";

type Props = {
  onDragEnd?: (dragItemIndex: number, dragOverIndex: number) => void;
  className?: string;
} & PropsWithChildren;

export const DragNDrop: FC<Props> = (props) => {
  const [isDragging, setDragging] = React.useState(false);
  const dragItemRef = React.useRef<number>(-1);
  const dragOverRef = React.useRef<number>(-1);

  const onDragStart = (position: number) => () => {
    dragItemRef.current = position;
    setDragging(true);
  };

  const onDragEnter = (position: number) => () => {
    dragOverRef.current = position;
  };

  const onDragEnd = () => {
    props?.onDragEnd?.(dragItemRef.current, dragOverRef.current);

    dragItemRef.current = -1;
    dragOverRef.current = -1;
    setDragging(false);
  };

  return React.Children.map(
    props.children as any,
    (child: React.ReactElement, index) => {
      if (!child) return null;
      return React.cloneElement(child, {
        key: `drag-drop-${index}`,
        onDragStart: onDragStart(index),
        onDragEnter: onDragEnter(index),
        onDragOver: (e: any) => e.preventDefault(),
        onDragEnd,
        className: cn(props.className, {
          "z-10": isDragging,
          "bg-white": isDragging,
        }),
        draggable: true,
        ...(isDragging && {
          outline: "1px solid",
          outlineColor: "gray.400",
        }),
      });
    }
  );
};
