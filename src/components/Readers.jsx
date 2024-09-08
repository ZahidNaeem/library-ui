import {useCallback} from "react";
import {addReader, deleteReader, editReader, findAllPaginatedReaders} from "../api/ReaderService";
import BasicLayout from "../common/BasicLayout";

const Readers = () => {

  const getReaders = useCallback(async (data, params) => {
    try {
      return await findAllPaginatedReaders(data, params);
    } catch (e) {
      console.log(e.response.data);
      return e.response;
    }
  }, []);

  async function add(updatedObject) {
    try {
      return await addReader(updatedObject);
    } catch (e) {
      return e.response;
    }
  }

  async function edit(updatedObject) {
    try {
      return await editReader(updatedObject);
    } catch (e) {
      return e.response;
    }
  }

  async function deleteById(id) {
    try {
      return await deleteReader({id});
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
  ];

  return (
      <div id="mainContainer">
        <BasicLayout
            formTitle="Reader"
            configurations={configurations}
            refreshData={async (data, params) => await getReaders(data, params)}
            saveFunction={async (updatedObject, operation) => operation.toLowerCase() === 'add' ? await add(updatedObject) : await edit(updatedObject)}
            deleteFunction={async (id) => await deleteById(id)}/>
      </div>
  );
}
export default Readers;