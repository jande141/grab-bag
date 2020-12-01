import React from "react";
import { Draggable } from "react-beautiful-dnd";

export const DragItem = ({ item, index }) => {
  return (
    <Draggable key={item.id} draggableId={String(item.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <img src={item.imageUrl} />
        </div>
      )}
    </Draggable>
  );
};
