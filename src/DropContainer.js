import React from "react";
import { Droppable } from "react-beautiful-dnd";
import { DragItem } from "./DragItem";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";

const grid = 8;

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
}));

export const DropContainer = ({ items, dropID }) => {
  const getListStyle = (isDraggingOver) => ({
    background: isDraggingOver ? "lightblue" : "lightgrey",
    padding: grid,
    width: "80%",
    columnCount: 7,
  });

  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Grid container spacing={3}>
        <Droppable droppableId={dropID}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}
            >
              {items.map((item, index) => (
                <Grid item xs={3}>
                  <DragItem item={item} index={index}></DragItem>
                </Grid>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </Grid>
    </div>
  );
};
