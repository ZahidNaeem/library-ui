import {useCallback, useEffect, useState} from "react";
import {addBook, deleteBook, editBook, findAllPaginatedBooks} from "../api/BookService";
import BasicLayout from "../common/BasicLayout";
import {findAllAuthors} from "../api/AuthorService";
import {findAllSubjects} from "../api/SubjectService";
import {findAllPublishers} from "../api/PublisherService";
import {findAllResearchers} from "../api/ResearcherService";
import {findAllShelves} from "../api/ShelfService";

const Books = () => {

  const [authors, setAuthors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [researchers, setResearchers] = useState([]);
  const [shelves, setShelves] = useState([]);

  const getBooks = useCallback(async (data, params) => {
    try {
      return await findAllPaginatedBooks(data, params);
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

  const getShelves = useCallback(async () => {
    try {
      const response = await findAllShelves();
      return response.data.entity;
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
    .then(authors => setAuthors(authors));
    getSubjects()
    .then(subjects => setSubjects(subjects));
    getPublishers()
    .then(publishers => setPublishers(publishers));
    getResearchers()
    .then(researchers => setResearchers(researchers));
    getShelves()
    .then(shelves => setShelves(shelves));
  }, [getAuthors, getPublishers, getResearchers, getShelves, getSubjects]);

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
      tableKey: "authorName",
      modalKey: "author",
      title: "Author",
      tableType: "text",
      modalType: "select",
      list: authors,
      listLabelKey: "name",
      listReturnKey: "id",
      required: true,
      sort: true,
      filter: true,
      filterModel: "",
      filterType: "enum",
    },

    {
      tableKey: "subjectName",
      modalKey: "subject",
      title: "Subject",
      tableType: "text",
      modalType: "select",
      list: subjects,
      listLabelKey: "name",
      listReturnKey: "id",
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
      tableKey: "researcherName",
      modalKey: "researcher",
      title: "Researcher",
      tableType: "text",
      modalType: "select",
      list: researchers,
      listLabelKey: "name",
      listReturnKey: "id",
      sort: true,
      filter: true,
      filterModel: "",
      filterType: "enum",
    },

    {
      tableKey: "shelfName",
      modalKey: "shelf",
      title: "Shelf",
      tableType: "text",
      modalType: "select",
      list: shelves,
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