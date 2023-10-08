import { useState } from 'react';

import * as React from 'react'

import "./styles/insights.css";

import { Party } from "./config/constants";

import { config } from './app.config';

import ky from 'ky-universal';

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

const types = [
  "MP",
  "Division"
]

const queries = [
  "most",
  "least"
];

const voteTyps = [
  "on",
  "for",
  "against",
];

const columnHelper = createColumnHelper();

const divisionColumns = [
  columnHelper.accessor('title', {
    cell: info => info.getValue(),
    header: () => <span>Name</span>
  }),  
  columnHelper.accessor(row => row.count, {
    id: 'count',
    cell: info => <i>{info.getValue()}</i>,
    header: () => <span>Count</span>
  })
]

const mpColumns = [
  columnHelper.accessor('title', {
    cell: info => info.getValue(),
    header: () => <span>Name</span>
  }),
  columnHelper.accessor('party', {
    cell: info => info.getValue(),
    header: () => <span>Party</span>
  }),
  columnHelper.accessor(row => row.count, {
    id: 'count',
    cell: info => <i>{info.getValue()}</i>,
    header: () => <span>Count</span>
  })
]



const Insights = () => {

  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const [type, setType] = useState(types[0]);
  const [query, setQuery] = useState(queries[0]);
  const [party, setParty] = useState("Any");
  const [voteType, setVoteType] = useState(voteTyps[0]);
  const [limit, setLimit] = useState(10);

  // const onQueryMpByName = async (name) => {

  //   setMpDetails(undefined);
  //   setDivisionDetails(undefined);

  //   console.log('select', name);

  //   const result = await ky(`https://members-api.parliament.uk/api/Members/Search?Name=${name}`).json();

  //   if (result && result.items && result.items[0]) {
  //     console.log('result ', result);
  //     setMpDetails(result.items[0]);
  //     onGetVotingSummary(result.items[0]?.value?.id);
  //   }
  // }

  // const onQueryMp = async (id) => {

  //   setMpDetails(undefined);
  //   setDivisionDetails(undefined);

  //   const result = await ky(`https://members-api.parliament.uk/api/Members/${id}`).json();

  //   setMpDetails(result);

  //   onGetVotingSummary(result?.value?.id);

  // }

  // const onQueryDivision = async (id) => {
  //   console.log('step 1 ', id);
  //   setMpDetails(undefined);
  //   setDivisionDetails(undefined);

  //   const result = await ky(`https://commonsvotes-api.parliament.uk/data/division/${id}.json`).json();

  //   setDivisionDetails(result)
  // }



  const onSearch = async () => {
    let url = `${config.mpsApiUrl}insights/${type === 'MP' ? 'mpvotes' : 'divisionvotes'}?limit=${limit}&orderby=${query === 'most' ? 'DESC' : 'ASC'}&&partyIncludes=${party}`;    

    if (type === 'Division' && voteType !== 'on') {
      const ayeOrNo = voteType === "for" ? "aye" : "no";
      url = `${url}&ayeorno=${ayeOrNo}`;
    }

    const result = await ky(url).json();
    console.log('result ', result);

    const formattedResult = [];
    if (type === 'Division') {
      setColumns(divisionColumns);
      result.forEach(i => {
        const row = { title: i._fields[0], count: i._fields[1].low };
        formattedResult.push(row);
      });
    } else {
      setColumns(mpColumns);
      result.forEach(i => {
        const row = { title: i._fields[0], party: i._fields[1], count: i._fields[2].low };
        formattedResult.push(row);
      });
    }
    console.log('formatted result ', formattedResult);

    setData(formattedResult);
  }

  return (

    <div className="insights">

      <div className="wrapper">

        <div className="insights__query">

          <div className="labelwrapper">
            <span>Which</span>

            <select
              className="select insights__select"
              name="type"
              onChange={(e) => setType(e.target.value)}
              value={type}
            >
              {types.map(type => (
                <option
                  value={type}
                  key={type}
                >
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="labelwrapper">

            {type === 'MP' && (
              party !== 'Any' ? <span>from the</span> : <span>from</span>
            )}

            {type === 'MP' && (
              <div>
                <select
                  className="select insights__select"
                  name="party"
                  onChange={(e) => setParty(e.target.value)}
                  value={party}
                >
                  {Object.values(Party).filter(i => i !== "Unknown").map(i => (
                    <option
                      value={i}
                      key={i}
                    >
                      {i}
                    </option>
                  ))}
                </select>

              </div>
            )}

            {type === 'MP' && <span>Party</span>}
          </div>

          <div className="labelwrapper">
            {type === 'MP' ? <span>voted the</span> : <span>was voted</span>}

            {type === 'Division' && (
              <select
                className="select insights__select"
                name="voteType"
                onChange={(e) => setVoteType(e.target.value)}
                value={voteType}
              >
                {voteTyps.map(i => (
                  <option
                    value={i}
                    key={i}
                  >
                    {i}
                  </option>
                ))}
              </select>
            )}


            {type === 'Division' && <span>the</span>}

            <select
              className="select insights__select"
              name="query"
              onChange={(e) => setQuery(e.target.value)}
              value={query}
            >
              {queries.map(query => (
                <option
                  value={query}
                  key={query}
                >
                  {query}
                </option>
              ))}
            </select>
          </div>
          <button
            style={{ width: '100%' }}
            className='button'
            onClick={onSearch}
          >
            Go
          </button>

        </div>
        <hr />

      </div>

      <div className="insughts__result">
        <table>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            {table.getFooterGroups().map(footerGroup => (
              <tr key={footerGroup.id}>
                {footerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.footer,
                        header.getContext()
                      )}
                  </th>
                ))}
              </tr>
            ))}
          </tfoot>
        </table>
      </div>

      <div className="wrapper">
        <hr />
        <div className="insights__config">
          <label>Result Limit</label>

          <input
            className="input"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            type="number">
          </input>
        </div>
      </div>

    </div>


  )
}

export default Insights;
