import React, { Component } from "react";
import ReactDOM from "react-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const LIMIT = 10;
const GRAB_BAG = "GrabBag";

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

/**
 * Moves an item from one list to another list.
 */
const move = (source, destination, droppableSource, droppableDestination) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result;
};

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,
  width: "100%",

  // change background colour if dragging
  background: isDragging ? "lightgreen" : "grey",

  // styles we need to apply on draggables
  ...draggableStyle,
});

const getListStyle = (isDraggingOver) => ({
  background: isDraggingOver ? "lightblue" : "lightgrey",
  padding: grid,
  width: "80%",
  columnCount: 5,
});

const getData = (app, offset) => {
  //console.log("in getData, offset=" + offset + ", LIMIT=" + LIMIT);
  callApi(offset, app.state.grabBagItems)
    .then((response) => {
      app.setState({ items: response });
    })
    .catch((error) => {
      console.error(error);
    });
};

async function callApi(offset, grabBgItems) {
  //create nap of grabbagitems
  var grabMap = new Map();
  for (var j = 0; j < grabBgItems.length; j++) {
    grabMap.set(grabBgItems[j].id, grabBgItems[j]);
  }

  const categories = await fetch(
    "https://www.ifixit.com/api/2.0/categories/all?limit=" +
      LIMIT +
      "&offset=" +
      offset
  ).then((response) => response.json());

  var items = new Map();
  for (var i = 0; i < categories.length; i++) {
    var cat = categories[i];

    const catInfo = await fetch(
      "https://www.ifixit.com/api/2.0/wikis/CATEGORY/" + encodeURIComponent(cat)
    ).then((response) => response.json());

    try {
      //  console.log(
      //    "in callApi, catInfo.wikiid=" +
      //      catInfo.wikiid +
      //      ", catInfo.category=" +
      //      catInfo.category +
      //      ", catInfo.image.thumbnail=" +
      //      catInfo.image.thumbnail
      //  );
      var item = {};
      item.id = catInfo.wikiid;
      item.category = catInfo.title;
      item.imageUrl = catInfo.image.thumbnail;
      // check if grabbagotmes has this id, if not add, if yes nothing
      if (!grabMap.has(item.id)) {
        items.set(item.id, item);
      }
    } catch (err) {
      // ignore as some items don't seem to have this attribute
    }
  }
  return Array.from(items.values());
}

class App extends Component {
  state = {
    items: [],
    grabBagItems: [],
    itemsOffset: -1 * LIMIT,
  };

  constructor(props) {
    super(props);
    //localStorage.clear();
    var prevState = localStorage.getItem(GRAB_BAG);
    //console.log("constructor, prevState=" + prevState);
    if (!prevState || prevState.length === 0) return;
    this.state.grabBagItems = JSON.parse(prevState);
  }

  /**
   * A semi-generic way to handle multiple lists. Matches
   * the IDs of the droppable container to the names of the
   * source arrays stored in the state.
   */
  id2List = {
    droppable: "items",
    droppable2: "grabBagItems",
  };

  getNext(a) {
    getData(a, a.state.itemsOffset + LIMIT);
    a.setState({ itemsOffset: a.state.itemsOffset + LIMIT }); //Increasing the offset for the next API call
  }

  getPrev(a) {
    if (a.state.itemsOffset - LIMIT < 0) return;
    getData(a, a.state.itemsOffset - LIMIT);
    a.setState({ itemsOffset: a.state.itemsOffset - LIMIT }); //decreasing the offset for the next API call
  }

  getList = (id) => this.state[this.id2List[id]];

  onDragEnd = (result) => {
    const { source, destination } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      const items = reorder(
        this.getList(source.droppableId),
        source.index,
        destination.index
      );

      let state = { items };

      if (source.droppableId === "droppable2") {
        state = { grabBagItems: items };
      }

      this.setState(state);
    } else {
      const result = move(
        this.getList(source.droppableId),
        this.getList(destination.droppableId),
        source,
        destination
      );

      this.setState({
        items: result.droppable,
        grabBagItems: result.droppable2,
      });
      localStorage.setItem(GRAB_BAG, JSON.stringify(result.droppable2));
    }
  };

  // Normally you would want to split things out into separate components.
  // But in this example everything is just done in one place for simplicity
  render() {
    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}
            >
              {this.state.items.map((item, index) => (
                <Draggable
                  key={item.id}
                  draggableId={String(item.id)}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={getItemStyle(
                        snapshot.isDragging,
                        provided.draggableProps.style
                      )}
                    >
                      <img src={item.imageUrl} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        <button onClick={() => this.getPrev(this)}>Get Previous</button>

        <button onClick={() => this.getNext(this)}>Get Next</button>

        <Droppable droppableId="droppable2">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}
            >
              {this.state.grabBagItems.map((item, index) => (
                <Draggable
                  key={item.id}
                  draggableId={String(item.id)}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={getItemStyle(
                        snapshot.isDragging,
                        provided.draggableProps.style
                      )}
                    >
                      <img src={item.imageUrl} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  }
}

// Put the things into the DOM!
ReactDOM.render(<App />, document.getElementById("root"));
