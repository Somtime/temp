const inputData = require('./inputData');
const expectedData = require('./expectedData');

const parseOrmData = (objectList) => {
  const result = [];
  let tempObject = {};
  objectList.forEach((object) => {
    const resultIndex = result.length - 1;
    let row;
    let isNull = false;
    let isNewRow = false;
    let isTempObjectPush = false;
    let tempObjectName = '';
    const objectKeys = Object.keys(object);
    objectKeys.forEach((key) => {
      const splitColumn = key.split('j_');
      const depth = splitColumn.length;
      const value = object[key];

      if (depth === 1) {
        const ifColumn = splitColumn;
        if (tempObjectName !== 'main_object') {
          tempObjectName = 'main_object';

          if (tempObject[ifColumn] !== value) {
            tempObject[ifColumn] = value;
            isNewRow = true;
          } else {
            isNewRow = false;
          }
        }

        if (isNewRow) {
          if (!row) row = {};
          row[ifColumn] = object[key];
        }
      } else if (depth) {
        const splitKey = key.split('j_');
        splitKey.reverse();
        const [column, ...objectNames] = splitKey;
        objectNames.reverse();

        const getTempObject = getNestedObject(tempObject, objectNames);
        let getRow = getNestedObject(row || result[resultIndex], objectNames, value);

        if (tempObjectName !== objectNames.join('.')) {
          tempObjectName = objectNames.join('.');
          isTempObjectPush = false;
          isNull = false;
          if (object[key] === null) return isNull = true;

          if (!Object.keys(getTempObject).length || !getTempObject[column].includes(value)) {
            if (!getTempObject) getTempObject = {};
            if (!getTempObject[column]) getTempObject[column] = [];

            getTempObject[column].push(value);
            isTempObjectPush = true;

            if (!isNewRow) {

              if (!Array.isArray(getRow)) {
                const temp = getRow;
                setNestedObject(result[resultIndex], objectNames, []);
                getRow = getNestedObject(result[resultIndex], objectNames, value);
                getRow.push(temp);
              }

              const newObject = {};
              newObject[column] = value;
              getRow.push(newObject);
            }
          }
        }

        if (isNull) return;
        if (isNewRow) {
          if (!getRow) getRow = {};
          getRow[column] = value;

        } else {
          if (!isTempObjectPush) return;

          const getRowIndex = getRow.length - 1;
          if (!getRow[getRowIndex]) getRow[getRowIndex] = {};
          getRow[getRowIndex][column] = value;
        }

        return result;
      }
    });
    if (isNewRow) result.push(row);
  });

  return result;
}


const getNestedObject = (object, objectNames, value) => {
  return objectNames.reduce((acc, key) => {
    if (!acc[key]) acc[key] = {}; // 키가 없으면 초기화
    if (value === null && !Object.keys(acc[key]).length) {
      acc[key] = null
    };
    return acc[key];
  }, object); // initial object
};

const setNestedObject = (object, objectNames, value) => {
  objectNames.reduce((acc, key, idx) => {
    if (idx === objectNames.length - 1) {
      acc[key] = value; // 최종 키에 값 설정
    }
    return acc[key];
  }, object);
};

const result = parseOrmData(inputData)
console.log(result[0], result.length);




































// const parseOrmData = (objectList) => {
//   const result = [];
//   let tempObject = {};
//   objectList.forEach((object) => {
//     let row = {};
//     let isNull = false;
//     let isNewRow = false;
//     let tempObjectName = '';
//     let isTempObjectPush = false;
//     const objectKeys = Object.keys(object);
//     objectKeys.forEach((key) => {
//       const splitColumn = key.split('j_');
//       const depth = splitColumn.length;
//       const value = object[key];

//       if (depth === 1) {
//         const ifColumn = splitColumn;
//         if (tempObjectName !== 'main_object') {
//           tempObjectName = 'main_object';

//           if (tempObject[ifColumn] !== value) {
//             tempObject[ifColumn] = value;
//             isNewRow = true;
//           }
//         }

//         if (isNewRow) {
//           row[ifColumn] = object[key];
//         }
//       } else if (depth === 2) {
//         const ifObject = splitColumn[0];
//         const ifColumn = splitColumn[1];

//         // ID 값일때 if문 탐색
//         if (tempObjectName !== `${ifObject}`) {
//           tempObjectName = `${ifObject}`;
//           isTempObjectPush = false;
//           isNull = false;
//           if (object[key] === null) isNull = true;

//           // tempObject ID list 에 push
//           if (!tempObject[ifObject] || !tempObject[ifObject][ifColumn].includes(value)) {
//             if (!tempObject[ifObject]) tempObject[ifObject] = {};
//             if (!tempObject[ifObject][ifColumn]) tempObject[ifObject][ifColumn] = [];
//             tempObject[ifObject][ifColumn].push(value);
//             isTempObjectPush = true;
//             if (!isNewRow) {

//               const resultIndex = result.length - 1;
//               // Object 로 들어가 있던 데이터에 배열로 추가로 넣어줘야 하기 때문에 Array 타입으로 변경
//               if (!Array.isArray(result[resultIndex][ifObject])) {
//                 const temp = result[resultIndex][ifObject];
//                 result[resultIndex][ifObject] = [];
//                 result[resultIndex][ifObject].push(temp);
//               }

//               const newObject = {};
//               newObject[ifColumn] = value;
//               result[resultIndex][ifObject].push(newObject);
//             }
//           } else if (isNull) {
//             return result[result.length - 1][ifObject] = null;
//           }
//         }

//         if (isNull) return;
//         if (isNewRow) {
//           if (!row[ifObject]) row[ifObject] = {}
//           row[ifObject][ifColumn] = value;
//         } else {
//           if (!isTempObjectPush) return;
//           const resultIndex = result.length - 1;
//           const ifResultObject = result[resultIndex][ifObject];
//           const ifResultObjectIndex = ifResultObject.length - 1;
//           if (!ifResultObject[ifResultObjectIndex]) ifResultObject[ifResultObjectIndex] = {};
//           ifResultObject[ifResultObjectIndex][ifColumn] = value;
//         }
//       } else if (depth === 3) {
//         const ifMotherObject = splitColumn[0];
//         const ifObject = splitColumn[1];
//         const ifColumn = splitColumn[2];
//         const value = object[key];

//         // ID 값일때 if문 탐색
//         if (tempObjectName !== `${ifMotherObject}.${ifObject}`) {
//           tempObjectName = `${ifMotherObject}.${ifObject}`;
//           isTempObjectPush = false;
//           isNull = false;
//           if (object[key] === null) isNull = true;

//           // tempObject ID list 에 push
//           if (!tempObject[ifMotherObject][ifObject] || !tempObject[ifMotherObject][ifObject][ifColumn].includes(value)) {
//             if (!tempObject[ifMotherObject]) tempObject[ifMotherObject] = {};
//             if (!tempObject[ifMotherObject][ifObject]) tempObject[ifMotherObject][ifObject] = {};
//             if (!tempObject[ifMotherObject][ifObject][ifColumn]) tempObject[ifMotherObject][ifObject][ifColumn] = [];
//             tempObject[ifMotherObject][ifObject][ifColumn].push(value);
//             isTempObjectPush = true;

//             if (!isNewRow) {
//               const resultIndex = result.length - 1;
//               // Object 로 들어가 있던 데이터에 배열로 추가로 넣어줘야 하기 때문에 Array 타입으로 변경
//               if (!Array.isArray(result[resultIndex][ifMotherObject][ifObject])) {
//                 const temp = result[resultIndex][ifMotherObject][ifObject];
//                 result[resultIndex][ifMotherObject][ifObject] = [];
//                 result[resultIndex][ifMotherObject][ifObject].push(temp);
//               }

//               const newObject = {};
//               newObject[ifColumn] = value;
//               result[resultIndex][ifMotherObject][ifObject].push(newObject);
//             } else if (isNull) {
//               return result[result.length - 1][ifMotherObject][ifObject] = null;
//             }
//           }
//         }

//         if (isNull) return;
//         if (isNewRow) {
//           if (!row[ifMotherObject][ifObject]) row[ifMotherObject][ifObject] = {}
//           row[ifMotherObject][ifObject][ifColumn] = value;
//         } else {
//           if (!isTempObjectPush) return;
//           const resultIndex = result.length - 1;
//           const ifResultObject = result[resultIndex][ifMotherObject][ifObject];
//           const ifResultObjectIndex = ifResultObject.length - 1;
//           if (!ifResultObject[ifResultObjectIndex]) ifResultObject[ifResultObjectIndex] = {};
//           ifResultObject[ifResultObjectIndex][ifColumn] = value;
//         }
//       } else if (depth === 4) {
//         // ...
//       }
//     });

//     if (isNewRow) result.push(row);
//   });
//   return result;
// }