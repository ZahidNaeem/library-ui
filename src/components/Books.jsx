import {useCallback, useEffect, useState} from "react";
import {addBook, deleteBook, editBook, findAllPaginatedBooks} from "../api/BookService";
import BasicLayout from "../common/BasicLayout";
import {findAllAuthors} from "../api/AuthorService";
import {findAllSubjects} from "../api/SubjectService";
import {findAllPublishers} from "../api/PublisherService";
import {findAllResearchers} from "../api/ResearcherService";
import {findAllRacks} from "../api/RackService";

const Books = () => {

  const [authors, setAuthors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [researchers, setResearchers] = useState([]);
  const [racks, setRacks] = useState([]);

  const getBooks = useCallback(async (data, params) => {
    try {
      const response = await findAllPaginatedBooks(data, params);
      response.data.entity.list
      .forEach(element => {
        const authorNames = element.authors.map(author => author.name).join(", ");
        const subjectNames = element.subjects.map(subject => subject.name).join(", ");
        const researcherNames = element.researchers.map(researcher => researcher.name).join(", ");
        element["authorNames"] = authorNames;
        element["subjectNames"] = subjectNames;
        element["researcherNames"] = researcherNames;
      });
      return response;
    } catch (e) {
      console.log(e.response.data);
      return e.response;
    }
  }, []);

  const getAuthors = useCallback(async () => {
    try {
      const response = await findAllAuthors();
      return response.data.entity;
    } catch (e) {
      console.log(e.response.data);
      return [];
    }
  }, []);

  const getSubjects = useCallback(async () => {
    try {
      const response = await findAllSubjects();
      return response.data.entity;
    } catch (e) {
      console.log(e.response.data);
      return [];
    }
  }, []);

  const getPublishers = useCallback(async () => {
    try {
      const response = await findAllPublishers();
      return response.data.entity;
    } catch (e) {
      console.log(e.response.data);
      return [];
    }
  }, []);

  const getResearchers = useCallback(async () => {
    try {
      const response = await findAllResearchers();
      return response.data.entity;
    } catch (e) {
      console.log(e.response.data);
      return [];
    }
  }, []);

  const getRacks = useCallback(async () => {
    try {
      const response = await findAllRacks();
      return response.data.entity && response.data.entity.map(rack => {
        return {id: rack.id, name: `${rack.shelfName} - ${rack.name}`};
      });
    } catch (e) {
      console.log(e.response.data);
      return [];
    }
  }, []);

  async function add(updatedObject) {
    try {
      return await addBook(updatedObject);
    } catch (e) {
      return e.response;
    }
  }

  async function edit(updatedObject) {
    try {
      return await editBook(updatedObject);
    } catch (e) {
      return e.response;
    }
  }

  async function deleteById(id) {
    try {
      return await deleteBook({id});
    } catch (e) {
      return e.response;
    }
  }

  useEffect(() => {
    getAuthors()
    .then(authors => setAuthors(authors.map(author => {
      return {id: author.id, name: author.name};
    })));
    getSubjects()
    .then(subjects => setSubjects(subjects.map(subject => {
      return {id: subject.id, name: subject.name};
    })));
    getPublishers()
    .then(publishers => setPublishers(publishers));
    getResearchers()
    .then(researchers => setResearchers(researchers.map(researcher => {
      return {id: researcher.id, name: researcher.name};
    })));
    getRacks()
    .then(racks => setRacks(racks));
  }, [getAuthors, getPublishers, getResearchers, getRacks, getSubjects]);

  const bookConditionList = [
    {value: 'New'},
    {value: 'Old'},
  ];

  const bookSourceList = [
    {value: 'Purchased'},
    {value: 'Gifted'},
    {value: 'Other'},
  ];

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
      tableKey: "bookNumber",
      modalKey: "bookNumber",
      title: "Book Number",
      tableType: "text",
      modalType: "input",
      required: true,
      sort: true,
      filter: true,
      filterModel: "",
      filterType: "input",
    },

    {
      tableKey: "publicationDate",
      modalKey: "publicationDate",
      title: "Publication Date",
      tableType: "date",
      modalType: "date",
      sort: true,
      filter: true,
      filterModel: "",
      filterType: "date",
    },

    {
      tableKey: "bookCondition",
      modalKey: "bookCondition",
      title: "Condition",
      tableType: "text",
      modalType: "select",
      list: bookConditionList,
      listLabelKey: "value",
      listReturnKey: "value",
      required: true,
      sort: true,
      filter: true,
      filterModel: "",
      filterType: "enum",
    },

    {
      tableKey: "bookSource",
      modalKey: "bookSource",
      title: "Source",
      tableType: "text",
      modalType: "select",
      list: bookSourceList,
      listLabelKey: "value",
      listReturnKey: "value",
      sort: true,
      filter: true,
      filterModel: "",
      filterType: "enum",
    },

    {
      tableKey: "authorNames",
      modalKey: "authors",
      title: "Author",
      tableType: "text",
      modalType: "select",
      list: authors,
      listLabelKey: "name",
      listReturnKey: null,
      multiple: true,
      required: true,
      sort: true,
      filter: true,
      filterModel: "",
      filterType: "enum",
    },

    {
      tableKey: "subjectNames",
      modalKey: "subjects",
      title: "Subject",
      tableType: "text",
      modalType: "select",
      list: subjects,
      listLabelKey: "name",
      listReturnKey: null,
      multiple: true,
      required: true,
      sort: true,
      filter: true,
      filterModel: "",
      filterType: "enum",
    },

    {
      tableKey: "publisherName",
      modalKey: "publisher",
      title: "Publisher",
      tableType: "text",
      modalType: "select",
      list: publishers,
      listLabelKey: "name",
      listReturnKey: "id",
      sort: true,
      filter: true,
      filterModel: "",
      filterType: "enum",
    },

    {
      tableKey: "researcherNames",
      modalKey: "researchers",
      title: "Researcher",
      tableType: "text",
      modalType: "select",
      list: researchers,
      listLabelKey: "name",
      listReturnKey: null,
      multiple: true,
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

    {
      configType: "nested",
      nestedKey: "volumes",
      nestedConfig: [
        {
          tableKey: "name",
          modalKey: "name",
          title: "Volume",
          tableType: "text",
          modalType: "input",
          required: true,
          sort: true,
          filter: true,
          filterModel: "",
          filterType: "input",
        },

        {
          tableKey: "rackName",
          modalKey: "rack",
          title: "Rack",
          tableType: "text",
          modalType: "select",
          list: racks,
          listLabelKey: "name",
          listReturnKey: "id",
          required: true,
          sort: true,
          filter: true,
          filterModel: "",
          filterType: "enum",
        },

        {
          tableKey: "pages",
          modalKey: "pages",
          title: "Total Pages",
          tableType: "text",
          modalType: "input",
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
    }
  ];

  return (
      <div id="mainContainer">
        <BasicLayout
            formTitle="Book"
            configurations={configurations}
            refreshData={async (data, params) => await getBooks(data, params)}
            saveFunction={async (updatedObject, operation) => operation.toLowerCase() === 'add' ? await add(updatedObject) : await edit(updatedObject)}
            deleteFunction={async (id) => await deleteById(id)}/>
      </div>
  );
}
export default Books;