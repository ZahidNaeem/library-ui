import AddEditModal from "./AddEditModal";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import plusImage from '../images/plus.svg';
import pencilImage from '../images/pencil.svg';
import trashImage from '../images/trash.svg';
import first from "../images/first.png";
import previous from "../images/previous.png";
import next from "../images/next.png";
import last from "../images/last.png";
import upArrowBlack from "../images/up-arrow-black.png";
import upArrowBlue from "../images/up-arrow-blue.png";
import downArrowBlue from "../images/down-arrow-blue.png";
import doubleArrowDown from '../images/double-arrow-down.svg';
import doubleArrowRight from '../images/double-arrow-right.svg';
import DropdownWithSearchOption from "./DropdownWithSearchOption";
import DeleteModal from "./DeleteModal";

const BasicLayout = ({
  formTitle,
  configurations,
  refreshData,
  saveFunction,
  deleteFunction
}) => {

  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [pageNumber, setPageNumber] = useState(0);
  const [sortBy, setSortBy] = useState("creationDate");
  const [sortDirection, setSortDirection] = useState("desc");
  const [tableDataObject, setTableDataObject] = useState([]);
  const [nestedConfig, setNestedConfig] = useState([]);
  const [tableRow, setTableRow] = useState(null);
  const [nestedField, setNestedField] = useState("");
  const [operation, setOperation] = useState("");
  const [filterObject, setFilterObject] = useState({});
  const [sortContents, setSortContents] = useState([]);
  const [detailsExpanded, setDetailsExpanded] = useState([]);

  const tableData = useMemo(() => {
    return tableDataObject.map(row => {
      configurations
        .filter((obj) => obj.modalType === "date")
        .map((obj) => obj.modalKey)
        .forEach(key => {
          row[key] = row[key].split("T")[0];
        });
      return row;
    });
  }, [tableDataObject, configurations]);

  const populateTable = useCallback(async () => {
    try {
      const params = { pageNumber, pageSize, sortBy, sortDirection };

      const response = await refreshData(filterObject, params);
      setTableDataObject(response.data.entity.list);
      const configWithNestedConfig = configurations.find(
        (obj) => obj.configType === "nested"
      );
      if (configWithNestedConfig) {
        setNestedConfig(configWithNestedConfig.nestedConfig);
        setNestedField(configWithNestedConfig.nestedKey);
      }
      configurations
        .filter((obj) => obj.modalType === "date")
        .map((obj) => obj.modalKey)
        .forEach((key) => {
          response.data.entity.list.forEach((row) => {
            row[key] = row[key].split("T")[0];
          });
        });
      const pages = response.data.entity.totalPages;
      const currentPage = response.data.entity.pageNumber;
      setPageNumber(Math.min(pages > 0 ? pages - 1 : 0, currentPage > -1 ? currentPage : 0));
      setTotalPages(pages);
    } catch (e) {
      console.error(e);
    }
  }, [configurations, filterObject, pageNumber, pageSize, refreshData, sortBy, sortDirection]);

  const toggleExpandDetails = (rowId) => {
    const array = [...detailsExpanded];
    const expanded = array.find((element) => element === rowId);
    if (expanded) {
      array.splice(detailsExpanded.indexOf(expanded), 1);
      setDetailsExpanded(array);
    } else {
      array.push(rowId);
      setDetailsExpanded(array);
    }
  }

  const isRowExpanded = (rowId) => {
    const expanded = detailsExpanded.find((element) => element === rowId);
    return !!expanded;

  }

  const add = () => {
    setTableRow({});
    const defaultValues = configurations.filter((conf) => conf.default);
    defaultValues.forEach(
      (val) => (tableRow[val.modalKey] = val.default)
    );
    setOperation('Add');
  }

  const edit = (row) => {
    setTableRow(row);
    setOperation('Update');
  }

  const handleModalClose = () => {
    setTableRow(null)
    setOperation(null);
  }

  const saveData = async (tableRow) => {
    console.log(
      `save from BasicLayout component called with operation: ${operation} - data: ${JSON.stringify(tableRow)}`,
    );
    try {
      const response = await saveFunction(tableRow, operation);
      if (response.data.success) {
        await populateTable();
        handleModalClose();
        toast.success(response.data.message);
      }
    } catch (e) {
      console.error(e);
      const message = e.response.data.message;
      console.error("Error Message", message);
      toast.error(message);
    }
  }

  const deleteRow = async (id) => {
    console.log(`Delete called with id: ${id}`);
    try {
      const response = await deleteFunction(id);
      if (response.data.success) {
        await populateTable();
        handleModalClose();
        toast.success(response.data.message);
      }
    } catch (e) {
      console.error(e.response.data);
      toast.error(e.response.data.message);
    }
    await populateTable();
  }

  const firstPage = () => {
    if (pageNumber !== 0) {
      setPageNumber(0);
    }
  }

  const previousPage = () => {
    if (pageNumber > 0) {
      setPageNumber(Math.max(pageNumber - 1, 0));
    }
  }

  const nextPage = () => {
    setPageNumber(Math.min(pageNumber + 1, totalPages - 1));
  }

  const lastPage = () => {
    const lastPage = Math.max(totalPages - 1, 0);
    if (pageNumber !== lastPage) {
      setPageNumber(lastPage);
    }
  }

  const getSortObject = (column) => {
    let sortObject = sortContents
      .find(element => element.column === column);
    if (!sortObject) {
      sortObject = {
        column,
        sortAsc: true,
        active: false
      }
      sortContents.push(sortObject);
    }
    return sortObject;
  }

  const getSortImage = (column) => {
    let sortObject = getSortObject(column);
    return !sortObject.active ? upArrowBlack : sortObject.sortAsc ? upArrowBlue : downArrowBlue;
  }

  const applySort = (column) => {
    const sortObject = getSortObject(column);
    sort(column, sortObject.active ? !sortObject.sortAsc : sortObject.sortAsc);
  }

  const sort = (column, asc) => {
    const sortedTableData = tableData.sort((a, b) => {
      if (asc) {
        return a[column] > b[column] ? 1 : a[column] < b[column] ? -1 : 0;
      } else {
        return b[column] > a[column] ? 1 : b[column] < a[column] ? -1 : 0;
      }
    });
    setTableDataObject(sortedTableData);
    const sortArray = [...sortContents];
    sortArray
      .forEach(element => {
        if (element.column === column) {
          element.active = true;
          element.sortAsc = asc;
        } else {
          element.active = false;
          element.sortAsc = true;
        }
      });
    setSortContents(sortArray);
  }

  const handleScroll = async (event, dropDownConfig) => {
    const element = event.target;
    if (element) {
      const bottomOfWindow =
        element.offsetHeight + element.scrollTop >= element.scrollHeight;
      if (element.scrollTop === 0) {
        const scroll = await dropDownConfig.paginationFunction(-1);
        if (scroll) {
          element.scrollTop = element.scrollHeight - 1000;
        }
      } else if (bottomOfWindow) {
        const scroll = await dropDownConfig.paginationFunction(1);
        if (scroll) {
          element.scrollTop = 1000;
        }
      }
    }
  }
  useEffect(() => {
    populateTable();
  }, [filterObject, populateTable]);

  const onFilterChange = (name, value) => {
    setFilterObject({ ...filterObject, [name]: value });
  }

  return (
    <div>
      <h1 className="form-title">{formTitle} Form</h1>
      <section>
        {tableData &&
          <div className="pagination-container">
            <img className="custom-img" src={first} alt="first" onClick={firstPage} />
            <img className="custom-img" src={previous} alt="previous" onClick={previousPage} />
            <span className="inner-pagination-content m-3">Page {pageNumber + 1} of {totalPages}</span>
            <img className="custom-img" src={next} alt="next" onClick={nextPage} />
            <img className="custom-img" src={last} alt="last" onClick={lastPage} />
          </div>
        }
        <div className="page-size">
          <label htmlFor="pageSize" className="col-form-label">Records Per Page</label>
          <select className="form-select" aria-label="Select an option" id="pageSize"
            onChange={(e) => setPageSize(e.target.value)}
            value={pageSize}>
            <option key="5" value="5">5</option>
            <option key="10" value="10">10</option>
            <option key="25" value="25">25</option>
            <option key="50" value="50">50</option>
            <option key="100" value="100">100</option>
          </select>
        </div>
      </section>
      <div className="main-page">
        <img className="custom-img" src={plusImage} alt="Add Row" onClick={() => add()} />
        <div className="awesome-table">
          <table className="table table-stripped table-hover scrollable">
            <thead>
              <tr>
                <th scope="col" className="short-column-center">#</th>
                {configurations && configurations.map((obj, index) =>
                  <th key={`${obj.tableKey}-${index}`} scope="col">
                    <div className="d-flex flex-row">
                      {obj.filter &&
                        <div>
                          {obj.filterType === 'input' &&
                            <input className="form-control" type="text" name={obj.modalKey}
                              value={filterObject[obj.tableKey] || ''} onChange={(e) => onFilterChange(e.target.name, e.target.value)} />}
                          {obj.filterType === 'date' &&
                            <input className="form-control" type="date" name={obj.modalKey}
                              value={filterObject[obj.tableKey] || ''} onChange={(e) => onFilterChange(e.target.name, e.target.value)} />}
                          {obj.filterType === 'checkbox' &&
                            <input className="form-control" type="checkbox" name={obj.modalKey}
                              value={filterObject[obj.tableKey] || ''} onChange={(e) => onFilterChange(e.target.name, e.target.value)} />}
                          {obj.filterType === 'enum' &&
                            <div className="typeahead-container">
                              <DropdownWithSearchOption
                                options={obj.list}
                                multiple={true}
                                labelKey={obj.listLabelKey}
                                onChange={(array) => onFilterChange(obj.listReturnKey, array.map(elem => elem[obj.listReturnKey]))} />
                            </div>
                          }
                        </div>
                      }
                      {obj.sort &&
                        <div className="d-flex flex-row" style={{ marginLeft: '10px' }}>
                          <img className="custom-img-shrink" src={getSortImage(obj.tableKey)} alt="Sort"
                            onClick={() => applySort(obj.tableKey)} />
                        </div>}
                    </div>
                    <div>{obj.title}</div>
                  </th>
                )}
                <th scope="col" className="short-column-center">Options</th>
                {nestedConfig.length > 0 &&
                  <th scope="col" className="short-column-center" />}
              </tr>
            </thead>
            <tbody>
              {tableData && tableData.map((row, index) =>
                <Fragment key={row.id}>
                  <tr>
                    <td className="short-column-center">{index + 1}</td>
                    {configurations && configurations.map((obj, index) =>
                      <td key={`${index}-${row[obj.tableKey]}`}>
                        {obj.tableType === 'text' && row[obj.tableKey]}
                        {obj.tableType === 'date' && row[obj.tableKey] && new Date(row[obj.tableKey]).toLocaleDateString()}
                        {obj.tableType === 'checkbox' &&
                          <div>
                            <div className="form-check">
                              <input className="form-check-input" type="checkbox" disabled
                                value={row[obj.tableKey]} />
                            </div>
                          </div>}
                      </td>
                    )}
                    <td>
                      <img src={pencilImage} alt="Edit" className="m-3 cursor-pointer"
                        onClick={() => edit(row)} />
                      <img src={trashImage} alt="Delete" className="m-1 cursor-pointer"
                        onClick={() => {
                          setTableRow(row);
                          setOperation('Delete');
                        }} />
                    </td>
                    {nestedConfig && nestedConfig.length > 0 &&
                      <td className="short-column-center cursor-pointer">
                        <img src={isRowExpanded(row.id) ? doubleArrowDown : doubleArrowRight} alt="details"
                          className="m-3 cursor-pointer"
                          onClick={() => toggleExpandDetails(row.id)} />
                      </td>}
                  </tr>
                  {nestedConfig.length > 0 &&
                    <tr>
                      <td colSpan="100">
                        {isRowExpanded(row.id) &&
                          <div className="card card-body">
                            <table className="table table-stripped table-hover">
                              <thead>
                                <tr>
                                  <th scope="col" className="short-column-center">#</th>
                                  {nestedConfig && nestedConfig.map((nestedObj) =>
                                    <th key={`${nestedObj.tableKey}-${row.id}`} scope="col">{nestedObj.title}</th>
                                  )}
                                </tr>
                              </thead>
                              <tbody>
                                {row[nestedField] && row[nestedField].map((nestedRow, nestedIndex) =>
                                  <tr key={nestedRow.id}>
                                    <td className="short-column-center">{nestedIndex + 1}</td>
                                    {nestedConfig && nestedConfig.map((nestedObj) =>
                                      <td key={`${nestedObj.tableKey}-${nestedRow.id}`}>
                                        {nestedObj.tableType === 'text' ?
                                          nestedRow[nestedObj.tableKey]
                                          : nestedObj.tableType === 'date' ?
                                            nestedRow[nestedObj.tableKey] && new Date(nestedRow[nestedObj.tableKey]).toLocaleDateString()
                                            : nestedObj.tableType === 'checkbox' ?
                                              <div>
                                                <div className="form-check">
                                                  <input className="form-check-input" type="checkbox" disabled
                                                    value={nestedRow[nestedObj.tableKey]} />
                                                </div>
                                              </div> : null
                                        }
                                      </td>
                                    )}
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        }
                      </td>
                    </tr>
                  }
                </Fragment>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {tableRow && operation && operation.toLowerCase() !== 'delete' &&
        <AddEditModal
          configurations={configurations}
          title={`${operation} ${formTitle}`}
          currentObject={tableRow}
          handelSave={async (updatedObject) => saveData(updatedObject)}
          handleClose={() => handleModalClose()} />
      }
      {tableRow && operation.toLowerCase() === 'delete' &&
        <DeleteModal
          handelDelete={() => deleteRow(tableRow.id)}
          handleClose={() => handleModalClose()} />
      }
    </div>
  );
}
export default BasicLayout;