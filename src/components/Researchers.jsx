import {useCallback} from "react";
import {addResearcher, deleteResearcher, editResearcher, findAllPaginatedResearchers} from "../api/ResearcherService";
import BasicLayout from "../common/BasicLayout";

const Researchers = () => {

  const getResearchers = useCallback(async (data, params) => {
    try {
      return await findAllPaginatedResearchers(data, params);
    } catch (e) {
      console.log(e.response.data);
      return e.response;
    }
  }, []);

  async function add(updatedObject) {
    try {
      return await addResearcher(updatedObject);
    } catch (e) {
      return e.response;
    }
  }

  async function edit(updatedObject) {
    try {
      return await editResearcher(updatedObject);
    } catch (e) {
      return e.response;
    }
  }

  async function deleteById(id) {
    try {
      return await deleteResearcher({id});
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
            formTitle="Researcher"
            configurations={configurations}
            refreshData={async (data, params) => await getResearchers(data, params)}
            saveFunction={async (updatedObject, operation) => operation.toLowerCase() === 'add' ? await add(updatedObject) : await edit(updatedObject)}
            deleteFunction={async (id) => await deleteById(id)}/>
      </div>
  );
}
export default Researchers;