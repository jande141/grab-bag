import React, { useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { ItemTypes } from './ItemTypes';

//import all the components we are going to use
import {
    Image,
    TouchableOpacity,
    FlatList,
} from 'react-native';

const style = {
    height: '12rem',
//    width: '12rem',
    marginRight: '1.5rem',
    marginBottom: '1.5rem',
    color: 'white',
    padding: '1rem',
    textAlign: 'center',
    fontSize: '1rem',
    lineHeight: 'normal',
    float: 'left',
};
export const GrabBag = () => {
    const [dataSource, setDataSource] = useState([]);

    const ItemView = ({ item }) => {
        //console.log('itemview:"' + item.imageUrl + '"');
        return (
                <Image source={{ uri: item.imageUrl }} />
        );
    };

    const [{ canDrop, isOver }, drop] = useDrop({
        accept: ItemTypes.IMAGE,
        drop: () => ({ name: 'GrabBag' }),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    });
    const isActive = canDrop && isOver;
    let backgroundColor = '#222';
    if (isActive) {
        backgroundColor = 'darkgreen';
    }
    else if (canDrop) {
        backgroundColor = 'darkkhaki';
    }
    return (<div ref={drop} style={{ ...style, backgroundColor }}>
        {isActive ? 'Release to drop' : 'Drag items here'}
        <FlatList
            data={dataSource}
            numColumns={6}
            keyExtractor={(item, index) => index.toString()}
            enableEmptySections={true}
            renderItem={ItemView}
        />
    </div>);




};
