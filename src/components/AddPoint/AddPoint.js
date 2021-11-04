import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { getCanvas, getGroup, getScene, getSceneModified, setSceneModified } from '../../features/scene/sceneSlice';
import * as THREE from "three";
import Button from '../Button/Button';
import { getSidebarWidth } from '../../features/dimensions/dimensionsSlice';
import { getHeaderHeight } from '../../features/dimensions/dimensionsSlice';
import { setIsTextOpen } from '../../features/comments/commentsSlice';

export default function AddPoint() {

    const [counter, setCounter] = useState(1);

    const scene = useSelector(getScene);
    const group = useSelector(getGroup);
    const canvas = useSelector(getCanvas);
    const isModified = useSelector(getSceneModified);
    const sidebarWidth = useSelector(getSidebarWidth);
    const headerHeight = useSelector(getHeaderHeight);

    const dispatch = useDispatch();
    const camera = scene.children && scene.children.find((children) => children.type === "PerspectiveCamera");
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();


    const addPoint = () => {

        canvas.addEventListener('dblclick', onPointerClick);
    }

    /**
         * Double Click event, the function creates a point when the user clicks on the mesh
         * @param {Event} event 
         */
    const onPointerClick = (event) => {

        pointer.x = ((event.clientX - sidebarWidth) / canvas.offsetWidth) * 2 - 1;
        pointer.y = - ((event.clientY - headerHeight) / canvas.offsetHeight) * 2 + 1;
        console.log(camera);
        raycaster.setFromCamera(pointer, camera);

        // See if the ray from the camera into the world hits one of our meshes
        const intersects = raycaster.intersectObjects(group.children, true);

        // Creates a point
        const geometry = new THREE.SphereGeometry(0.5, 32, 16);
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const sphere = new THREE.Mesh(geometry, material);

        console.log(intersects);
        if (intersects.length > 0) {
            // for (let i = 0; i < intersects.length; i++) {

            //intersects[ i ].object.material.color.set( 0xff0000 );
            sphere.position.set(intersects[0].point.x, intersects[0].point.y, intersects[0].point.z);
            sphere.name = 'Point' + counter;
            scene.add(sphere);

            setCounter(counter => counter + 1);
            // setOpenText(true);

            dispatch(setIsTextOpen(true));
            dispatch(setSceneModified(!isModified));
            // }
        }
    }

    return (
        <Button typeClass="btn--size" text="ADD POINT" onClick={addPoint} />
    )
}