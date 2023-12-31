/* eslint-disable no-unused-vars */
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils";

/**
 * Creates the mesh with offset
 * @param {String} data The data to read
 * @param {Number} offset The offset number to offset the mesh
 */
export const createOffsetMesh = (data, offset) => {
  let initialObjects;
  initialObjects = parseASCII(data);

  const newObjects = createNewObjects(initialObjects, offset);

  // - Recreate the new file
  //const newFile = parseExport(newObjects);

  // - Create the mesh from object
  const mesh = createMeshFromObject(newObjects);

  // Create a mesh from file
  //const mesh = createMeshFromFile(newFile);

  return mesh;
};

/**
 * Reads the file and creates an object
 * @param {String} data The content of the file
 * @returns The content of the file in an array of objects
 */
const parseASCII = (data) => {
  const patternSolid = /solid([\s\S]*?)endsolid/g;
  const patternFace = /facet([\s\S]*?)endfacet/g;

  const patternFloat = /[\s]+([+-]?(?:\d*)(?:\.\d*)?(?:[eE][+-]?\d+)?)/.source;
  const patternVertex = new RegExp("vertex" + patternFloat + patternFloat + patternFloat, "g");
  const patternNormal = new RegExp("normal" + patternFloat + patternFloat + patternFloat, "g");

  let result;
  let initialObjects = [];

  while ((result = patternSolid.exec(data)) !== null) {
    const solid = result[0];
    let faceNumber = 0;

    while ((result = patternFace.exec(solid)) !== null) {
      const text = result[0];

      faceNumber++;
      const normalV = [];
      const verticesV = [];

      while ((result = patternNormal.exec(text)) !== null) {
        normalV.push(parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3]));
      }

      while ((result = patternVertex.exec(text)) !== null) {
        const verticesXYZ = [];
        verticesXYZ.push(parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3]));
        verticesV.push(verticesXYZ);
      }

      let initialObject = {
        face: faceNumber,
        normal: normalV,
        vertices: verticesV,
      };

      initialObjects.push(initialObject);
    }
  }
  return initialObjects;
};

/**
 * Creates the new objects with the new positions and normals
 * @param {Array} initialObjects The data from the file
 * @param {Number} offset The offset to move the mesh
 * @returns Array of objects
 */
const createNewObjects = (initialObjects, offset) => {
  // const length = initialObjects.length;
  // const newObjects = Array(length).fill(newObject);

  // creare la nuova struttra identica all'originale ma vuota
  const newObjects = initialObjects.map((item) => {
    return {
      ...item,
      normal: [],
      vertices: [],
    };
  });

  // cicla sulla lista
  for (var i = 0; i < initialObjects.length; i++) {
    // cicla su vertices
    for (var j = 0; j < initialObjects[i].vertices.length; j++) {
      // creare una nuova lista temporanea di oggetti
      const tempList = [];
      // Si aggiungono i valori del vettore corrente
      tempList.push({
        face: initialObjects[i].face,
        normal: initialObjects[i].normal,
        vertexPositionInTheObject: j,
      });
      // salva il vertice corrente
      const currentVertex = initialObjects[i].vertices[j];
      // cancella il vertice corrente dall'oggetto
      initialObjects[i].vertices[j] = undefined;

      if (currentVertex !== undefined) {
        // cicla sulla lista dal sucessivo
        for (var z = 1; z < initialObjects.length; z++) {
          // cicla su vertices del successivo
          for (var y = 0; y < initialObjects[z].vertices.length; y++) {
            if (initialObjects[z].vertices[y] !== undefined) {
              const result = compare(currentVertex, initialObjects[z].vertices[y]);
              if (result) {
                const tempObject = {
                  face: initialObjects[z].face,
                  normal: initialObjects[z].normal,
                  vertexPositionInTheObject: y,
                };
                tempList.push(tempObject);

                // cancellare il vertice appena comparato
                initialObjects[z].vertices[y] = undefined;
              }
            }
          }
        }

        // - recuperare dalla nuova lista tutte le normali e fare la somma
        const normalsSum = calcNormalsSum(tempList);

        // - normalizzare il vettore normale ottenuto
        // dividere gli elementi del vettore per il modulo del vettore
        // radicequadrata(x^2 + y^2 + z^2) = modulo
        const normalizedNormal = normalizeNormal(normalsSum);

        // - fare la funzione spostamento con la normale normalizzata appena calcolata
        //const offset = 2;
        const newPosition = calcNewPosition(offset, normalizedNormal, currentVertex);

        // - salvare tutti i nuovi dati nella stessa posizione in una nuova struttura
        //   identica all'iniziale
        tempList.map((tempObject) => {
          newObjects.find((newObject) => {
            if (newObject.face === tempObject.face) {
              newObject.vertices[tempObject.vertexPositionInTheObject] = newPosition;
            }
          });
        });
      }
    }
  }

  // - calcolo della nuova normale con tutte le facce del nuovo oggetto
  newObjects.map((item) => {
    const newNormal = calculateNewNormal(item.vertices[0], item.vertices[1], item.vertices[2]);
    return {
      ...item,
      normal: item.normal.push(newNormal[0], newNormal[1], newNormal[2]),
    };
  });

  return newObjects;
};

/**
 * Compares two arrays
 * @param {Array} array1 The first array
 * @param {Array} array2 The second array
 * @returns Boolean - true if the two arrays are equal
 */
const compare = (array1, array2) => {
  const result = array1.every((element, index) => {
    if (element === array2[index]) {
      return true;
    }
    return false;
  });
  return result;
};

/**
 * Calculates the sum of the normals of the faces
 * @param {Array} tempList Array of objects with the same vertex
 * @returns The sum of all the normals
 */
const calcNormalsSum = (tempList) => {
  // const result = tempList.reduce((prev, curr) => prev + curr.normal, 0);
  let sumX = 0;
  let sumY = 0;
  let sumZ = 0;

  tempList.map((item) => {
    sumX += item.normal[0];
    sumY += item.normal[1];
    sumZ += item.normal[2];
  });

  return [sumX, sumY, sumZ];
};

/**
 * Normalizes the normal vector
 * @param {Array} normal The normal
 * @returns The normalized normal
 */
const normalizeNormal = (normal) => {
  const modul = Math.sqrt(Math.pow(normal[0], 2) + Math.pow(normal[1], 2) + Math.pow(normal[2], 2));

  const normalizedNormal = [normal[0] / modul, normal[1] / modul, normal[2] / modul];

  return normalizedNormal;
};

/**
 * Calculates the new position of the vertex
 * @param {Number} offset The offset
 * @param {Array} normal The normal
 * @param {Array} vertex The vertex
 * @returns The new position of the vertex
 */
const calcNewPosition = (offset, normal, vertex) => {
  return [offset * normal[0] + vertex[0], offset * normal[1] + vertex[1], offset * normal[2] + vertex[2]];
};

/**
 * Calculates the new normal of the face
 * @param {Array} v1 The first vertex
 * @param {Array} v2 The second vertex
 * @param {Array} v3 The third vertex
 * @returns The new normal
 */
const calculateNewNormal = (v1, v2, v3) => {
  const nx = (v2[1] - v1[1]) * (v3[2] - v1[2]) - (v2[2] - v1[2]) * (v3[1] - v1[1]);
  const ny = -((v2[0] - v1[0]) * (v3[2] - v1[2]) - (v2[2] - v1[2]) * (v3[0] - v1[0]));
  const nz = (v2[0] - v1[0]) * (v3[1] - v1[1]) - (v2[1] - v1[1]) * (v3[0] - v1[0]);

  const normal = [nx, ny, nz];
  const normalizedNormal = normalizeNormal(normal);

  return normalizedNormal;
};

/**
 * Create the new file to be exported
 * @param {Object} data The data to be processed
 * @returns A string containing the processed data
 */
const parseExport = (data) => {
  let output = "solid exported\n";

  data.map((item) => {
    output += "\tfacet normal " + item.normal[0] + " " + item.normal[1] + " " + item.normal[2] + "\n";
    output += "\t\touter loop\n";

    item.vertices.map((vertex) => {
      output += "\t\t\tvertex " + vertex[0] + " " + vertex[1] + " " + vertex[2] + "\n";
    });

    output += "\t\tendloop\n";
    output += "\tendfacet\n";
  });
  output += "endsolid exported\n";
  return output;
};

const createMeshFromFile = (file) => {
  const geometry = new STLLoader().parse(file);
  // geometry.computeVertexNormals();

  // Add indices to geometry
  const newGeometry = mergeVertices(geometry);
  newGeometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    color: "#C7AC96",
    side: THREE.DoubleSide,
    vertexColors: true,
    wireframe: true,
  });

  const mesh = new THREE.Mesh(newGeometry, material);

  return mesh;
};

const createMeshFromObject = (object) => {
  const geometry = new THREE.BufferGeometry();
  const material = new THREE.MeshStandardMaterial({
    color: "#fff000",
    side: THREE.DoubleSide,
    vertexColors: true,
  });

  const normals = [];
  const vertices = [];

  object.map((item) => {
    item.vertices.map((vertex) => {
      normals.push(item.normal[0], item.normal[1], item.normal[2]);
      vertices.push(vertex[0], vertex[1], vertex[2]);
    });
  });

  let normalsPosition = new Float32Array(object.length * 3 * 3);
  let verticesPosition = new Float32Array(object.length * 3 * 3);

  for (let i = 0; i < normals.length; i = i + 3) {
    normalsPosition[i] = normals[i];
    normalsPosition[i + 1] = normals[i + 1];
    normalsPosition[i + 2] = normals[i + 2];

    verticesPosition[i] = vertices[i];
    verticesPosition[i + 1] = vertices[i + 1];
    verticesPosition[i + 2] = vertices[i + 2];
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(verticesPosition, 3));
  geometry.setAttribute("normal", new THREE.BufferAttribute(normalsPosition, 3));

  const newGeometry = mergeVertices(geometry);
  newGeometry.computeVertexNormals();

  const colorArray = new Uint8Array(newGeometry.attributes.position.count * 3);
  colorArray.fill(255);
  const colorAttr = new THREE.BufferAttribute(colorArray, 3, true);
  colorAttr.setUsage(THREE.DynamicDrawUsage);
  newGeometry.setAttribute("color", colorAttr);

  const mesh = new THREE.Mesh(newGeometry, material);

  return mesh;
};
