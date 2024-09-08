import {useCallback, useEffect, useState} from "react";
import {addSubject, deleteSubject, editSubject, findAllPaginatedSubjects, findAllSubjects, findParentSubjects} from "../api/SubjectService";
import BasicLayout from "../common/BasicLayout";

const Subjects = () => {

  const [parentSubjects, setParentSubjects] = useState([]);

  const getSubjects = useCallback(async (data, params) => {
    try {
      return await findAllPaginatedSubjects(data, params);
    } catch (e) {
      console.log(e.response.data);
      return e.response;
    }
  }, []);

  const getParentSubjects = useCallback(async () => {
    try {
      const response = await findAllSubjects();
      return response.data.entity;
    } catch (e) {
      console.log(e.response.data);
      return [];
    }
  }, []);

  async function add(updatedObject) {
    try {
      const response = await addSubject(updatedObject);
      updateParentSubjects();
      return response;
    } catch (e) {
      return e.response;
    }
  }

  async function edit(updatedObject) {
    try {
      const response = await editSubject(updatedObject);
      updateParentSubjects();
      return response;
    } catch (e) {
      return e.response;
    }
  }

  async function deleteById(id) {
    try {
      const response = await deleteSubject({id});
      updateParentSubjects();
      return response;
    } catch (e) {
      return e.response;
    }
  }

  const updateParentSubjects = useCallback(() => {
    getParentSubjects()
    .then(list => {
      setParentSubjects(list);
    })
    .catch(e => console.error("getParentSubjects Errors", e));
  }, [getParentSubjects]);

  useEffect(() => {
    updateParentSubjects();
  }, [updateParentSubjects]);

  const configurations = [
    {
      tableKey: "code",
      modalKey: "code",
      title: "Code",
      tableType: "text",
      modalType: "input",
      required: true,
      sort: true,
      filter: true,
      filterModel: "",
      filterType: "input",
    },

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
      tableKey: "parentSubjectName",
      modalKey: "parentSubject",
      title: "Parent Subject",
      tableType: "text",
      modalType: "select",
      list: parentSubjects,
      listLabelKey: "name",
      listReturnKey: "id",
      sort: true,
      filter: true,
      filterModel: "",
      filterType: "enum",
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
            formTitle="Subject"
            configurations={configurations}
            refreshData={async (data, params) => await getSubjects(data, params)}
            saveFunction={async (updatedObject, operation) => operation.toLowerCase() === 'add' ? await add(updatedObject) : await edit(updatedObject)}
            deleteFunction={async (id) => await deleteById(id)}/>
      </div>
  );
}
export default Subjects;