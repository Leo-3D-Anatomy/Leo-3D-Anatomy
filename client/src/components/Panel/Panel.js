import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getGroup, getSceneModified, getScene, setSelectedMesh } from '../../features/scene/sceneSlice';
import PanelItem from '../PanelItem/PanelItem';

export default function Panel(props) {

    const scene = useSelector(getScene);
    const [meshList, setMeshList] = useState([]);
    const [planeList, setPlaneList] = useState([]);
    const [pointList, setPointList] = useState([]);

    const group = useSelector(getGroup);
    const isModified = useSelector(getSceneModified);
    const dispatch = useDispatch();

    const tControls = scene.children && scene.children.find((obj) => obj.name === "TransformControls");

    useEffect(() => {
        setMeshList(meshList.filter(mesh => mesh.parent !== null));
        if (scene.children) {
            scene.children.map((obj, i) => {
                if (obj.type === "Group") {
                    obj.children.map((mesh) => {
                        addMeshToList(meshList, mesh, setMeshList);
                    })
                } else if (obj.name.startsWith("Plane")) {
                    addMeshToList(planeList, obj, setPlaneList);
                } else if (obj.name.startsWith("Point")) {
                    addMeshToList(pointList, obj, setPointList);
                }
            })
        }
    }, [isModified])

    /**
     * Checks if the mesh is in the list and if it is not add the mesh to the list
     * @param {Array} list List of meshes
     * @param {Mesh} mesh THREE.Mesh
     * @param {SetStateAction} saveState React state of list
     */
    const addMeshToList = (list, mesh, saveState) => {
        const isContainMesh = list.some((item) => item.uuid === mesh.uuid);

        if (list.length > 0) {
            if (!isContainMesh) {
                saveState((prev) => [...prev, mesh]);
            }
        } else {
            saveState((prev) => [...prev, mesh]);
        }
    }

    /**
     * Deletes the object from HTML and scene 
     * @param {Event} e 
     */
    const deleteClick = (e) => {
        const name = e.target.attributes.name.nodeValue;
        const id = e.target.attributes.id.nodeValue;
        const parent = e.target.parentNode;

        setMeshList(meshList.filter(mesh => mesh.uuid !== id));
        setPlaneList(planeList.filter(mesh => mesh.uuid !== id));
        setPointList(pointList.filter(mesh => mesh.uuid !== id));

        // When the first element is deleted the selection go to the second, this is a workaround, pass a not existing id
        // no one mesh is selected
        dispatch(setSelectedMesh(1));

        scene.children.forEach((object) => {
            if (object.type === 'Group') {
                object.children.forEach((item) => {
                    if (item.uuid === id) {
                        object.remove(item);
                    }
                });
            } else if (object.type === 'Mesh') {
                if (object.uuid === id) {
                    scene.remove(object);
                    tControls.detach();
                }
            }
        })
    }

    return (
        <div className="panel">
            {
                props.type === "scene"
                    ?
                    <div id="scene" className="">
                        {
                            meshList.length > 0 && meshList.map((mesh, i) => <PanelItem key={i} name={mesh.name} uuid={mesh.uuid} deleteClick={deleteClick} type="scene" />)
                        }
                    </div>
                    :
                    props.type === "planes"
                        ?
                        <div id="planes" className="">
                            {
                                planeList.length > 0 && planeList.map((mesh, i) => <PanelItem key={i} name={mesh.name} uuid={mesh.uuid} deleteClick={deleteClick} type="planes" />)
                            }
                        </div>
                        :
                        <div id="points" className="">
                            {
                                pointList.length > 0 && pointList.map((mesh, i) => <PanelItem key={i} name={mesh.name} uuid={mesh.uuid} deleteClick={deleteClick} type="points" />)
                            }
                        </div>
            }
        </div>
    )
}