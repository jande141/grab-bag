import React from "react";
import { Droppable } from "react-beautiful-dnd";
import { DragItem } from "./DragItem";

const grid = 8;

export const DropContainer = ({ items, dropID }) => {
  const getListStyle = (isDraggingOver) => ({
    background: isDraggingOver ? "lightblue" : "lightgrey",
    padding: grid,
    width: "80%",
    columnCount: 5,
  });

  return (
    <Droppable droppableId={dropID}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          style={getListStyle(snapshot.isDraggingOver)}
        >
          {items.map((item, index) => (
            <DragItem item={item} index={index}></DragItem>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};
