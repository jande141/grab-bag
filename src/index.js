import React, { Component } from "react";
import ReactDOM from "react-dom";
import { DragDropContext } from "react-beautiful-dnd";
import { DropContainer } from "./DropContainer";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";

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

const getData = (app, offset) => {
  callApi(offset, app.state.grabBagItems)
    .then((response) => {
      app.setState({ items: response });
    })
    .catch((error) => {
      console.error(error);
    });
};

async function callApi(offset, grabBgItems) {
  //create map of grabbagitems
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

  componentDidMount() {
    this.getNext(this);
  }

  constructor(props) {
    super(props);
    var prevState = localStorage.getItem(GRAB_BAG);
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

  classes = makeStyles((theme) => ({
    root: {
      "& > *": {
        margin: theme.spacing(1),
      },
    },
  }));

  render() {
    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <DropContainer
          items={this.state.items}
          dropID={"droppable"}
        ></DropContainer>

        <Button
          variant="contained"
          color="primary"
          onClick={() => this.getPrev(this)}
        >
          Get Previous
        </Button>

        <Button
          variant="contained"
          color="primary"
          onClick={() => this.getNext(this)}
        >
          Get Next
        </Button>

        <DropContainer
          items={this.state.grabBagItems}
          dropID={"droppable2"}
        ></DropContainer>
      </DragDropContext>
    );
  }
}

// Put the things into the DOM!
ReactDOM.render(<App />, document.getElementById("root"));
