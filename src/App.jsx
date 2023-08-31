import React, { useState } from 'react';
import './App.scss';
import cn from 'classnames';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

const products = productsFromServer.map((product) => {
  const category = categoriesFromServer
    .find(({ id }) => id === product.categoryId);

  const user = usersFromServer.find(({ id }) => id === category.ownerId);

  return {
    id: product.id,
    productName: product.name,
    title: category.title,
    icon: category.icon,
    sex: user.sex,
    userName: user.name,
  };
});

const filterProduct = (userFilter, inputState, categoriesList) => {
  if (!userFilter && !inputState && !categoriesList.length) {
    return products;
  }

  let prods = [...products];

  if (userFilter) {
    prods = prods.filter(({ userName }) => userName === userFilter);
  }

  const newInputValue = inputState.trim().toLowerCase();

  if (inputState) {
    prods = prods.filter(({ productName }) => productName
      .trim().toLowerCase().includes(newInputValue));
  }

  if (categoriesList.length) {
    prods = prods.filter(({ title }) => categoriesList.includes(title));
  }

  return prods;
};

const sortProducts = (prevProds, sortState, sortCoefficient) => {
  if (!sortCoefficient) {
    return prevProds;
  }

  const copyProds = [...prevProds];

  switch (sortState) {
    case 'ID': return copyProds.sort((a, b) => (a.id - b.id) * sortCoefficient);
    case 'Product': return copyProds
      .sort((a, b) => (a.productName
        .localeCompare(b.productName)) * sortCoefficient);
    case 'Category': return copyProds
      .sort((a, b) => (a.title
        .localeCompare(b.title)) * sortCoefficient);
    case 'User': return copyProds
      .sort((a, b) => (a.userName
        .localeCompare(b.userName)) * sortCoefficient);

    default: throw new Error('Error');
  }
};

const getSortValue = (currentCoeff) => {
  if (currentCoeff === 0) {
    return 1;
  }

  if (currentCoeff === 1) {
    return -1;
  }

  return 0;
};

const sortFields = ['ID', 'Product', 'Category', 'User'];

export const App = () => {
  const [userFilter, setUserFilter] = useState('');
  const [inputState, setInputState] = useState('');
  const [categoriesList, setCategoriesList] = useState([]);
  const [sortState, setSortState] = useState('');
  const [sortCoefficient, setSortCoefficient] = useState(0);

  let prods = filterProduct(userFilter, inputState, categoriesList);

  prods = sortProducts(prods, sortState, sortCoefficient);

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <p className="panel-tabs has-text-weight-bold">
              <a
                data-cy="FilterAllUsers"
                href="#/"
                onClick={() => {
                  setUserFilter('');
                }}
                className={cn({ 'is-active': !userFilter })}
              >
                All
              </a>

              {usersFromServer.map(({ id, name }) => (
                <a
                  key={id}
                  className={cn({ 'is-active': name === userFilter })}
                  data-cy="FilterUser"
                  href="#/"
                  onClick={() => {
                    setUserFilter(name);
                  }}
                >
                  {name}
                </a>
              ))}
            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  type="text"
                  className="input"
                  placeholder="Search"
                  value={inputState}
                  onChange={event => setInputState(event.target.value)}
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>

                {inputState.length > 0 && (
                  <span className="icon is-right">
                    {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                    <button
                      data-cy="ClearButton"
                      type="button"
                      className="delete"
                      onClick={() => setInputState('')}
                    />
                  </span>
                )}

              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className={cn('button', 'is-success', 'mr-6', {
                  'is-outlined': categoriesList.length,
                })}
                onClick={() => setCategoriesList([])}
              >
                All
              </a>

              {categoriesFromServer.map(({ id, title }) => (
                <a
                  key={id}
                  data-cy="Category"
                  className={cn('button', 'mr-2', 'my-1', {
                    'is-info': categoriesList.includes(title),
                  })}
                  href="#/"
                  onClick={() => {
                    if (!categoriesList.includes(title)) {
                      setCategoriesList(prevState => ([
                        ...prevState,
                        title,
                      ]));
                    } else {
                      setCategoriesList((prevState) => {
                        const copy = [...prevState];

                        copy.splice(copy.indexOf(title), 1);

                        return copy;
                      });
                    }
                  }}
                >
                  {title}
                </a>
              ))}
            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className="button is-link is-outlined is-fullwidth"
                onClick={() => {
                  setInputState('');
                  setUserFilter('');
                  setCategoriesList([]);
                  setSortCoefficient(0);
                  setSortState('');
                }}
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          {prods.length ? (
            <table
              data-cy="ProductTable"
              className="table is-striped is-narrow is-fullwidth"
            >
              <thead>
                <tr>
                  {sortFields.map(el => (
                    <th
                      key={el}
                      onClick={() => {
                        if (sortState === el) {
                          setSortCoefficient(getSortValue(sortCoefficient));

                          return;
                        }

                        setSortState(el);
                        setSortCoefficient(1);
                      }}
                    >
                      <span className="is-flex is-flex-wrap-nowrap">
                        {el}

                        <a href="#/">
                          <span className="icon">
                            <i
                              data-cy="SortIcon"
                              className={cn('fas', {
                                'fa-sort': sortState !== el
                                || (sortState === el
                                  && sortCoefficient === 0),
                                'fa-sort-down': sortState === el
                                  && sortCoefficient === -1,
                                'fa-sort-up': sortState === el
                                  && sortCoefficient === 1,
                              })}
                            />
                          </span>
                        </a>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {prods.map((el) => {
                  const { id, productName, title, icon, sex, userName } = el;

                  return (
                    <tr data-cy="Product" key={id}>
                      <td className="has-text-weight-bold" data-cy="ProductId">
                        {id}
                      </td>

                      <td data-cy="ProductName">{productName}</td>
                      <td data-cy="ProductCategory">{`${icon} - ${title}`}</td>

                      <td
                        data-cy="ProductUser"
                        className={cn({
                          'has-text-link': sex === 'm',
                          'has-text-danger': sex === 'f',
                        })}
                      >
                        {userName}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
            : (
              <p data-cy="NoMatchingMessage">
                No products matching selected criteria
              </p>
            )}
        </div>
      </div>
    </div>
  );
};
