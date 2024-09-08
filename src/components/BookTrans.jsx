import {useCallback, useEffect, useState} from "react";
import {addBookTrans, deleteBookTrans, editBookTrans, findAllPaginatedBookTrans} from "../api/BookTransService";
import BasicLayout from "../common/BasicLayout";
import {findAllReaders} from "../api/ReaderService";
import {findAllFilteredVolumes} from "../api/VolumeService";

const BookTrans = () => {

  const [readers, setReaders] = useState([]);
  const [filteredVolumes, setFilteredVolumes] = useState([]);

  const getBookTrans = useCallback(async (data, params) => {
    try {
      return await findAllPaginatedBookTrans(data, params);
    } catch (e) {
      console.log(e.response.data);
      return e.response;
    }
  }, []);

  const getReaders = useCallback(async () => {
    try {
      const response = await findAllReaders();
      return response.data.entity;
    } catch (e) {
      console.log(e.response.data);
      return [];
    }
  }, []);

  const getFilteredVolumes = useCallback(async () => {
    try {
      const response = await findAllFilteredVolumes();
      let entity = response.data.entity;
      if (entity) {
        entity = [...entity].map(element => JSON.parse(element));
      }
      return entity;
    } catch (e) {
      console.log(e.response.data);
      return [];
    }
  }, []);

  async function add(updatedObject) {
    try {
      const response = await addBookTrans(updatedObject);
      const volumes = await getFilteredVolumes();
      setFilteredVolumes(volumes);
      return response;
    } catch (e) {
      return e.response;
    }
  }

  async function edit(updatedObject) {
    try {
      const response = await editBookTrans(updatedObject);
      const volumes = await getFilteredVolumes();
      setFilteredVolumes(volumes);
      return response;
    } catch (e) {
      return e.response;
    }
  }

  async function deleteById(id) {
    try {
      const response = await deleteBookTrans({id});
      const volumes = await getFilteredVolumes();
      setFilteredVolumes(volumes);
      return response;
    } catch (e) {
      return e.response;
    }
  }

  useEffect(() => {
    getReaders()
    .then(readers => setReaders(readers));
    getFilteredVolumes()
    .then(volumes => setFilteredVolumes(volumes));
  }, [getReaders, getFilteredVolumes]);

  const configurations = [
    {
      tableKey: "readerName",
      modalKey: "reader",
      title: "Reader",
      tableType: "text",
      modalType: "select",
      list: readers,
      listLabelKey: "name",
      listReturnKey: "id",
      required: true,
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
      nestedKey: "bookTransLines",
      nestedConfig: [
        {
          tableKey: "volumeName",
          modalKey: "volume",
          title: "Volume",
          tableType: "text",
          modalType: "select",
          list: filteredVolumes,
          listLabelKey: "volumeName",
          listReturnKey: "volume",
          required: true,
          sort: true,
          filter: true,
          filterModel: "",
          filterType: "enum",
        },

        {
          tableKey: "issuanceDate",
          modalKey: "issuanceDate",
          title: "Issuance Date",
          tableType: "date",
          modalType: "date",
          default: new Date().toISOString().split('T')[0],
          required: true,
          sort: true,
          filter: true,
          filterModel: "",
          filterType: "date",
        },

        {
          tableKey: "receiptDate",
          modalKey: "receiptDate",
          title: "Receipt Date",
          tableType: "date",
          modalType: "date",
          sort: true,
          filter: true,
          filterModel: "",
          filterType: "date",
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
            formTitle="Transactions"
            configurations={configurations}
            refreshData={async (data, params) => await getBookTrans(data, params)}
            saveFunction={async (updatedObject, operation) => operation.toLowerCase() === 'add' ? await add(updatedObject) : await edit(updatedObject)}
            deleteFunction={async (id) => await deleteById(id)}/>
      </div>
  );
}
export default BookTrans;