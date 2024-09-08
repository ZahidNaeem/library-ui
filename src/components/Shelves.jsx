import {useCallback} from "react";
import {addShelf, deleteShelf, editShelf, findAllPaginatedShelves} from "../api/ShelfService";
import BasicLayout from "../common/BasicLayout";

const Shelves = () => {

  const getShelves = useCallback(async (data, params) => {
    try {
      return await findAllPaginatedShelves(data, params);
    } catch (e) {
      console.log(e.response.data);
      return e.response;
    }
  }, []);

  async function add(updatedObject) {
    try {
      return await addShelf(updatedObject);
    } catch (e) {
      return e.response;
    }
  }

  async function edit(updatedObject) {
    try {
      return await editShelf(updatedObject);
    } catch (e) {
      return e.response;
    }
  }

  async function deleteById(id) {
    try {
      return await deleteShelf({id});
    } catch (e) {
      return e.response;
    }
  }

  const configurations = [
    {
      tableKey: "name",
      modalKey: "name",
      title: "Name",
      tableType: "text",
      modalType: "input",
      required: true,
      sort: true,
      filter: true,
      filterModel: "",
      filterType: "input",
    },

    {
      tableKey: "remarks",
      modalKey: "remarks",
      title: "Remarks",
      tableType: "text",
      modalType: "textarea",
      sort: true,
      filter: true,
      filterModel: "",
      filterType: "input",
    },

    {
      configType: "nested",
      nestedKey: "racks",
      nestedConfig: [
        {
          tableKey: "name",
          modalKey: "name",
          title: "Rack Name",
          tableType: "text",
          modalType: "input",
          required: true,
          sort: true,
          filter: true,
          filterModel: "",
          filterType: "input",
        },

        {
          tableKey: "remarks",
          modalKey: "remarks",
          title: "Remarks",
          tableType: "text",
          modalType: "textarea",
          sort: true,
          filter: true,
          filterModel: "",
          filterType: "input",
        },
      ],
    },
  ];

  return (
      <div id="mainContainer">
        <BasicLayout
            formTitle="Shelf"
            configurations={configurations}
            refreshData={async (data, params) => await getShelves(data, params)}
            saveFunction={async (updatedObject, operation) => operation.toLowerCase() === 'add' ? await add(updatedObject) : await edit(updatedObject)}
            deleteFunction={async (id) => await deleteById(id)}/>
      </div>
  );
}
export default Shelves;