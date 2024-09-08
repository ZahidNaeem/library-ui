import {useCallback} from "react";
import {addPublisher, deletePublisher, editPublisher, findAllPaginatedPublishers} from "../api/PublisherService";
import BasicLayout from "../common/BasicLayout";

const Publishers = () => {

  const getPublishers = useCallback(async (data, params) => {
    try {
      return await findAllPaginatedPublishers(data, params);
    } catch (e) {
      console.log(e.response.data);
      return e.response;
    }
  }, []);

  async function add(updatedObject) {
    try {
      return await addPublisher(updatedObject);
    } catch (e) {
      return e.response;
    }
  }

  async function edit(updatedObject) {
    try {
      return await editPublisher(updatedObject);
    } catch (e) {
      return e.response;
    }
  }

  async function deleteById(id) {
    try {
      return await deletePublisher({id});
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
            formTitle="Publisher"
            configurations={configurations}
            refreshData={async (data, params) => await getPublishers(data, params)}
            saveFunction={async (updatedObject, operation) => operation.toLowerCase() === 'add' ? await add(updatedObject) : await edit(updatedObject)}
            deleteFunction={async (id) => await deleteById(id)}/>
      </div>
  );
}
export default Publishers;