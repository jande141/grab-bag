//import React in our code
import React, { useState, useEffect } from 'react';
import { DragImage } from './DragImage';
import { GrabBag } from './GrabBag';
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

//import all the components we are going to use
import {
  SafeAreaView,
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';

const App = () => {
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState([]);
  const [offset, setOffset] = useState(1);

  useEffect(() => getData(), []);

  const getData = () => {

    var limit = 10;
    setLoading(true);
    callApi(limit, offset)
      .then(response => {
        setDataSource([...dataSource, ...response]);
        setOffset(offset + limit);       //Increasing the offset for the next API call
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  async function callApi(limit, offset) {
    const categories = await fetch('https://www.ifixit.com/api/2.0/categories/all?limit=' + limit + '&offset=' + offset)
      .then(response => response.json());

    var items = [];
    for (var i = 0; i < categories.length; i++) {
      var cat = categories[i];

      const catInfo = await fetch('https://www.ifixit.com/api/2.0/wikis/CATEGORY/' + encodeURIComponent(cat))
        .then(response => response.json());

      try {
        var item = {};
        item.category = catInfo.title;
        item.imageUrl = catInfo.image.thumbnail;
        items.push(item);
      } catch (err) {
        // ignore as some items don't seem to have this attribute
      }
    }
    return items;
  }

  const renderFooter = () => {
    return (
      //Footer View with Load More button
      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={getData}
          //On Click of button load more data
          style={styles.loadMoreBtn}>
          <Text style={styles.btnText}>Load More</Text>
          {loading ? (
            <ActivityIndicator
              color="white"
              style={{ marginLeft: 8 }} />
          ) : null}
        </TouchableOpacity>
      </View>
    );
  };

  const ItemView = ({ item }) => {
    //console.log('itemview:"' + item.imageUrl + '"');

    return (
      <DragImage imageUrl={item.imageUrl} />
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <DndProvider backend={HTML5Backend}>
        <View style={styles.container}>
          <FlatList
            data={dataSource}
            numColumns={6}
            keyExtractor={(item, index) => index.toString()}
            enableEmptySections={true}
            renderItem={ItemView}
            ListFooterComponent={renderFooter}
          />
        </View>
        <View style={styles.container}>
          <GrabBag></GrabBag>
        </View>
        </DndProvider>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    flex: 1,
    borderStyle: 'solid',
    borderColor: '#000000',
    borderWidth: 2,
  },
  footer: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  loadMoreBtn: {
    padding: 10,
    backgroundColor: '#800000',
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: 'white',
    fontSize: 15,
    textAlign: 'center',
  },
  text: {
    color: 'red',
    fontSize: 15,
    textAlign: 'center',
    fontWeight: 'bold'
  },
  itemContainer: {
    height: 110,
    width: 110,
    margin: 10,
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 6,
  },
  image: {
    height: '100%',
    borderRadius: 4,
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 4,
  },
});

export default App;

