import React from 'react';
import { useDrag } from 'react-dnd';
import { ItemTypes } from './ItemTypes';
import { Image } from 'react-native';

const style = {
    border: '1px solid gray',
    //backgroundColor: 'white',
    padding: '0.5rem 1rem',
    marginRight: '1.5rem',
    marginBottom: '1.5rem',
    cursor: 'move',
    float: 'left',
};
export const DragImage = ({ imageUrl }) => {

    const [{ isDragging }, drag] = useDrag({
        item: { imageUrl, type: ItemTypes.IMAGE },
        end: (item, monitor) => {
            const dropResult = monitor.getDropResult();
            if (item && dropResult) {
                alert(`Dropped ${item.imageUrl} into ${dropResult.name}`);
            }
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });
    const opacity = isDragging ? 0.4 : 1;
    return (<div ref={drag} style={{ ...style, opacity }}>
         <img src={imageUrl} />
     </div>);
};
