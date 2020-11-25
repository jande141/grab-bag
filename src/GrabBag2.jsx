import React, { useState, useEffect } from "react";
import { useDrop } from "react-dnd";
import styled from "styled-components";
import { ItemTypes } from "./ItemTypes";
import { DragImage } from "./DragImage";

//import all the components we are going to use
import { Image, TouchableOpacity, FlatList } from "react-native";

const Container = styled.div`
  height: 50px;
  width: 80vw;
  background-color: ${({ highlight }) => (highlight ? "green" : "red")};
  margin-bottom: 10px;
  padding: 5px;
  display: flex;
  justify-content: space-evenly;
`;

const style = {
  height: "12rem",
  //    width: '12rem',
  marginRight: "1.5rem",
  marginBottom: "1.5rem",
  color: "white",
  padding: "1rem",
  textAlign: "center",
  fontSize: "1rem",
  lineHeight: "normal",
  float: "left",
  overflowX: "scroll",
};
export const GrabBag2 = ({ items }) => {
  // const ItemView = ({ item }) => {
  //   //console.log('itemview:"' + item.imageUrl + '"');
  //   return <Image source={{ uri: item.imageUrl }} />;
  // };

  const ItemView = ({ item }) => {
    //console.log('itemview:"' + item.imageUrl + '"');

    return <DragImage imageUrl={item.imageUrl} />;
  };

  const [{ canDrop, isOver }, drop] = useDrop({
    accept: ItemTypes.IMAGE,
    drop: () => ({ name: "GrabBag2" }),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });
  const isActive = canDrop && isOver;
  let backgroundColor = "#222";
  if (isActive) {
    backgroundColor = "darkgreen";
  } else if (canDrop) {
    backgroundColor = "darkkhaki";
  }
  return (
    <div ref={drop} style={{ ...style, backgroundColor }}>
      {isActive ? "Release to drop" : "Drag items here"}
      <FlatList
        data={items}
        numColumns={6}
        keyExtractor={(item, index) => index.toString()}
        enableEmptySections={true}
        renderItem={ItemView}
      />
    </div>
  );
};
