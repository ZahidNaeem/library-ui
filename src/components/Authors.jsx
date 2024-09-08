import {useCallback} from "react";
import {addAuthor, deleteAuthor, editAuthor, findAllPaginatedAuthors} from "../api/AuthorService";
import BasicLayout from "../common/BasicLayout";

const Authors = () => {

  const getAuthors = useCallback(async (data, params) => {
    try {
      return await findAllPaginatedAuthors(data, params);
    } catch (e) {
      console.log(e.response.data);
      return e.response;
    }
  }, []);

  async function add(updatedObject) {
    try {
      return await addAuthor(updatedObject);
    } catch (e) {
      return e.response;
    }
  }

  async function edit(updatedObject) {
    try {
      return await editAuthor(updatedObject);
    } catch (e) {
      return e.response;
    }
  }

  async function deleteById(id) {
    try {
      return await deleteAuthor({id});
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
            formTitle="Author"
            configurations={configurations}
            refreshData={async (data, params) => await getAuthors(data, params)}
            saveFunction={async (updatedObject, operation) => operation.toLowerCase() === 'add' ? await add(updatedObject) : await edit(updatedObject)}
            deleteFunction={async (id) => await deleteById(id)}/>
      </div>
  );
}
export default Authors;