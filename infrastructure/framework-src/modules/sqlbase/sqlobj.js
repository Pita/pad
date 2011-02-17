/**
 * Copyright 2009 Google Inc.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import("cache_utils.syncedWithCache");
import("sqlbase.sqlcommon.*");
import("jsutils.*");
import("etherpad.log");

jimport("java.lang.System.out.println");
jimport("java.sql.Statement");


// YOURNAME:
// YOURCOMMENT
function _withCache(name, fn) {
  return syncedWithCache('sqlobj.'+name, fn);
}


// YOURNAME:
// YOURCOMMENT
function getIdColspec() {
  return ('INT NOT NULL '+autoIncrementClause()+' PRIMARY KEY');
}


// YOURNAME:
// YOURCOMMENT
function getLongtextColspec(extra) {
  var spec = getSqlBase().longTextType();
  if (extra) {
    spec = (spec + " " + extra);
  }
  return spec;
}


// YOURNAME:
// YOURCOMMENT
function getBoolColspec(extra) {
  var spec;
  if (isMysql()) {
    spec = 'TINYINT(1)';
  } else {
    spec = 'SMALLINT';
  }
  if (extra) {
    spec = (spec + " " + extra);
  }
  return spec;
}


// YOURNAME:
// YOURCOMMENT
function getDateColspec(extra) {
  var spec;
  if (isMysql()) {
    spec = 'DATETIME';
  } else {
    spec = 'TIMESTAMP';
  }
  if (extra) {
    spec = (spec + " " + extra);
  }
  return spec;
}


// YOURNAME:
// YOURCOMMENT
function _bq(x) { return btquote(x); }

/*
 * for debugging queries
 */

// YOURNAME:
// YOURCOMMENT
function _qdebug(q) {
  if (appjet.config.debugSQL) {
    println(q);
  }
}

/** executeFn is either "execute" or "executeUpdate" "executeQuery" */

// YOURNAME:
// YOURCOMMENT
function _execute(stmnt, executeFn) {
  if (!executeFn) {
    executeFn = 'execute';
  }

  // YOURNAME:
  // YOURCOMMENT
  return withConnection(function(conn) {
    var pstmnt = conn.prepareStatement(stmnt);

    // YOURNAME:
    // YOURCOMMENT
    return closing(pstmnt, function() {
      _qdebug(stmnt);
      return pstmnt[executeFn]();
    });
  });
}


// YOURNAME:
// YOURCOMMENT
function _executeUpdate(stmnt) {
  return _execute(stmnt, 'executeUpdate');
}


// YOURNAME:
// YOURCOMMENT
function _executeQuery(stmnt) {
  return _execute(stmnt, 'executeQuery');
}

/*
 * Not all SQL/JS types supported.
 */

// YOURNAME:
// YOURCOMMENT
function _getJsValFromResultSet(rs, type, colName) {
  var r;
  if (type == java.sql.Types.VARCHAR ||
      type == java.sql.Types.LONGVARCHAR ||
      type == java.sql.Types.CHAR) {
    r = String(rs.getString(colName));
  } else if (type == java.sql.Types.TIMESTAMP) {
    var t = rs.getTimestamp(colName);
    if (t) {
      r = new Date(t.getTime());
    } else {
      r = null;
    }
  } else if (type == java.sql.Types.BIGINT ||
             type == java.sql.Types.INTEGER ||
             type == java.sql.Types.SMALLINT ||
             type == java.sql.Types.TINYINT) {
    r = rs.getInt(colName);
  } else if (type == java.sql.Types.DECIMAL) {
    r = rs.getFloat(colName);
  } else if (type == java.sql.Types.BIT) {
    r = rs.getBoolean(colName);
  } else {
    throw Error("Cannot fetch sql type ID "+type+" (columnName = "+colName+")");
  }

  if (rs.wasNull()) {
    r = null;
  }
  return r;
}


// YOURNAME:
// YOURCOMMENT
function _lookupColumnType(tableName, columnName) {

  // YOURNAME:
  // YOURCOMMENT
  return withConnection(function(conn) {
    var metadata = conn.getMetaData();
    var rs = metadata.getColumns(null, null, tableName, columnName);
    if (!rs) {
      throw Error("Table '"+tableName+"' does not appear to have colum '"+columnName+"'.");
    }
    var rsmd = rs.getMetaData();
    var colCount = rsmd.getColumnCount();
//    rs.first();
    rs.next();
    var type = rs.getInt("DATA_TYPE");
    return type;
  });
}

/* cached, on misses calls _lookuParameterType */

// YOURNAME:
// YOURCOMMENT
function _getParameterType(tableName, columnName) {
  var key = [tableName, columnName].join(".");

  // YOURNAME:
  // YOURCOMMENT
  return _withCache('column-types', function(cache) {
    if (!cache[key]) {
      cache[key] = _lookupColumnType(tableName, columnName);
    }
    return cache[key];
  });
}

/*
 * Not all SQL/JS types supported.
 */

// YOURNAME:
// YOURCOMMENT
function _setPreparedValues(tableName, pstmnt, keyList, obj, indexOffset) {
  if (!indexOffset) { indexOffset = 0; }

  for (var i = 1; i <= keyList.length; i++) {
    var k = keyList[i-1];
    var v = obj[k];
    var j = i + indexOffset;

    if (v === undefined) {
      throw Error("value is undefined for key "+k);
    }

    if (v === null) {
      var type = _getParameterType(tableName, k);
      pstmnt.setNull(j, type);
    } else if (typeof(v) == 'string') {
      pstmnt.setString(j, v);
    } else if (typeof(v) == 'number') {
      pstmnt.setInt(j, v);
    } else if (typeof(v) == 'boolean') {
      pstmnt.setBoolean(j, v);
    } else if (v.valueOf && v.getDate && v.getHours) {
      pstmnt.setTimestamp(j, new java.sql.Timestamp(+v));
    } else {
      throw Error("Cannot insert this type of javascript object: "+typeof(v)+" (key="+k+", value = "+v+")");
    }
  }
}


// YOURNAME:
// YOURCOMMENT
function _resultRowToJsObj(resultSet) {
  var resultObj = {};

  var metaData = resultSet.getMetaData();
  var colCount = metaData.getColumnCount();

  for (var i = 1; i <= colCount; i++) {
    var colName = metaData.getColumnLabel(i);
    var type = metaData.getColumnType(i);
    resultObj[colName] = _getJsValFromResultSet(resultSet, type, colName);
  }

  return resultObj;
}

/*
 * Inserts the object into the given table, and returns auto-incremented ID if any.
 */

// YOURNAME:
// YOURCOMMENT
function insert(tableName, obj) {
  var keyList = keys(obj);

  var stmnt = "INSERT INTO "+_bq(tableName)+" (";

  // YOURNAME:
  // YOURCOMMENT
  stmnt += keyList.map(function(k) { return _bq(k); }).join(', ');
  stmnt += ") VALUES (";

  // YOURNAME:
  // YOURCOMMENT
  stmnt += keyList.map(function(k) { return '?'; }).join(', ');
  stmnt += ")";


  // YOURNAME:
  // YOURCOMMENT
  return withConnection(function(conn) {
    var pstmnt = conn.prepareStatement(stmnt, Statement.RETURN_GENERATED_KEYS);

    // YOURNAME:
    // YOURCOMMENT
    return closing(pstmnt, function() {
      _setPreparedValues(tableName, pstmnt, keyList, obj, 0);
      _qdebug(stmnt);
      pstmnt.executeUpdate();
      var rs = pstmnt.getGeneratedKeys();
      if (rs != null) {

        // YOURNAME:
        // YOURCOMMENT
        return closing(rs, function() {
          if (rs.next()) {
            return rs.getInt(1);
          }
        });
      }
    });
  });
};

/*
 * Selects a single object given the constraintMap.  If there are more
 * than 1 objects that match, it will return a single one of them
 * (unspecified which one).  If no objects match, returns null.
 *
 * constraints is a javascript object of column names to values.
 *  Currently only supports string equality of constraints.
 */

// YOURNAME:
// YOURCOMMENT
function selectSingle(tableName, constraints) {
  var keyList = keys(constraints);

  var stmnt = "SELECT * FROM "+_bq(tableName)+" WHERE (";

  // YOURNAME:
  // YOURCOMMENT
  stmnt += keyList.map(function(k) { return '('+_bq(k)+' = '+'?)'; }).join(' AND ');
  stmnt += ')';
  if (isMysql()) {
    stmnt += ' LIMIT 1';
  }


  // YOURNAME:
  // YOURCOMMENT
  return withConnection(function(conn) {
    var pstmnt = conn.prepareStatement(stmnt);

    // YOURNAME:
    // YOURCOMMENT
    return closing(pstmnt, function() {
      _setPreparedValues(tableName, pstmnt, keyList, constraints, 0);
      _qdebug(stmnt);
      var resultSet = pstmnt.executeQuery();

      // YOURNAME:
      // YOURCOMMENT
      return closing(resultSet, function() {
        if (!resultSet.next()) {
          return null;
        }
        return _resultRowToJsObj(resultSet);
      });
    });
  });
}


// YOURNAME:
// YOURCOMMENT
function _makeConstraintString(key, value) {
  if (typeof(value) != 'object' || ! (value instanceof Array)) {
    return '('+_bq(key)+' = ?)';
  } else {
    var comparator = value[0];
    return '('+_bq(key)+' '+comparator+' ?)';
  }
}


// YOURNAME:
// YOURCOMMENT
function _preparedValuesConstraints(constraints) {
  var c = {};

  // YOURNAME:
  // YOURCOMMENT
  eachProperty(constraints, function(k, v) {
    c[k] = (typeof(v) != 'object' || ! (v instanceof Array) ? v : v[1]);
  });
  return c;
}


// YOURNAME:
// YOURCOMMENT
function selectMulti(tableName, constraints, options) {
  if (!options) {
    options = {};
  }

  var constraintKeys = keys(constraints);

  var stmnt = "SELECT * FROM "+_bq(tableName)+" ";

  if (constraintKeys.length > 0) {
    stmnt += "WHERE (";

    // YOURNAME:
    // YOURCOMMENT
    stmnt += constraintKeys.map(function(key) { 
        return _makeConstraintString(key, constraints[key]);
      }).join(' AND ');
    stmnt += ')';
  }

  if (options.orderBy) {
    var orderEntries = [];

    // YOURNAME:
    // YOURCOMMENT
    options.orderBy.split(",").forEach(function(orderBy) {
      var asc = "ASC";
      if (orderBy.charAt(0) == '-') {
        orderBy = orderBy.substr(1);
        asc = "DESC";
      }
      orderEntries.push(_bq(orderBy)+" "+asc);
    });
    stmnt += " ORDER BY "+orderEntries.join(", ");
  }
  
  if (options.limit) {
    stmnt += " LIMIT "+options.limit;
  }


  // YOURNAME:
  // YOURCOMMENT
  return withConnection(function(conn) {
    var pstmnt = conn.prepareStatement(stmnt);

    // YOURNAME:
    // YOURCOMMENT
    return closing(pstmnt, function() {
      _setPreparedValues(
        tableName, pstmnt, constraintKeys, 
        _preparedValuesConstraints(constraints), 0);

      _qdebug(stmnt);
      var resultSet = pstmnt.executeQuery();
      var resultArray = [];


      // YOURNAME:
      // YOURCOMMENT
      return closing(resultSet, function() {
        while (resultSet.next()) {
          resultArray.push(_resultRowToJsObj(resultSet));
        }

        return resultArray;
      });
    });
  });
}


// YOURNAME:
// YOURCOMMENT
function executeRaw(stmnt, params) {

  // YOURNAME:
  // YOURCOMMENT
  return withConnection(function(conn) {
    var pstmnt = conn.prepareStatement(stmnt);

    // YOURNAME:
    // YOURCOMMENT
    return closing(pstmnt, function() {
      for (var i = 0; i < params.length; i++) {
	var v = params[i];

	if (v === undefined) {
	  throw Error("value is undefined for key "+i);
	}

	if (typeof(v) == 'object' && v.isnull) {
	  pstmnt.setNull(i+1, v.type);
	} else if (typeof(v) == 'string') {
	  pstmnt.setString(i+1, v);
	} else if (typeof(v) == 'number') {
	  pstmnt.setInt(i+1, v);
	} else if (typeof(v) == 'boolean') {
	  pstmnt.setBoolean(i+1, v);
	} else if (v.valueOf && v.getDate && v.getHours) {
	  pstmnt.setTimestamp(i+1, new java.sql.Timestamp(+v));
	} else {
	  throw Error("Cannot insert this type of javascript object: "+typeof(v)+" (key="+i+", value = "+v+")");
	}
      }

      _qdebug(stmnt);
      var resultSet = pstmnt.executeQuery();
      var resultArray = [];


      // YOURNAME:
      // YOURCOMMENT
      return closing(resultSet, function() {
        while (resultSet.next()) {
          resultArray.push(_resultRowToJsObj(resultSet));
        }

        return resultArray;
      });
    });
  });
}

/* returns number of rows updated */

// YOURNAME:
// YOURCOMMENT
function update(tableName, constraints, obj) {
  var objKeys = keys(obj);
  var constraintKeys = keys(constraints);

  var stmnt = "UPDATE "+_bq(tableName)+" SET ";

  // YOURNAME:
  // YOURCOMMENT
  stmnt += objKeys.map(function(k) { return ''+_bq(k)+' = ?'; }).join(', ');
  stmnt += " WHERE (";

  // YOURNAME:
  // YOURCOMMENT
  stmnt += constraintKeys.map(function(k) { return '('+_bq(k)+' = ?)'; }).join(' AND ');
  stmnt += ')';


  // YOURNAME:
  // YOURCOMMENT
  return withConnection(function(conn) {
    var pstmnt = conn.prepareStatement(stmnt);

    // YOURNAME:
    // YOURCOMMENT
    return closing(pstmnt, function() {
      _setPreparedValues(tableName, pstmnt, objKeys, obj, 0);
      _setPreparedValues(tableName, pstmnt, constraintKeys, constraints, objKeys.length);
      _qdebug(stmnt);
      return pstmnt.executeUpdate();
    });
  });
}


// YOURNAME:
// YOURCOMMENT
function updateSingle(tableName, constraints, obj) {
  var count = update(tableName, constraints, obj);
  if (count != 1) {
    throw Error("save count != 1.  instead, count = "+count);
  }
}


// YOURNAME:
// YOURCOMMENT
function deleteRows(tableName, constraints) {
  var constraintKeys = keys(constraints);
  var stmnt = "DELETE FROM "+_bq(tableName)+" WHERE (";

  // YOURNAME:
  // YOURCOMMENT
  stmnt += constraintKeys.map(function(k) { return '('+_bq(k)+' = ?)'; }).join(' AND ');
  stmnt += ')';

  // YOURNAME:
  // YOURCOMMENT
  withConnection(function(conn) {
    var pstmnt = conn.prepareStatement(stmnt);

    // YOURNAME:
    // YOURCOMMENT
    closing(pstmnt, function() {
      _setPreparedValues(tableName, pstmnt, constraintKeys, constraints);
      _qdebug(stmnt);
      pstmnt.executeUpdate();
    });
  })
}

//----------------------------------------------------------------
// table management
//----------------------------------------------------------------

/*
 * Create a SQL table, specifying column names and types with a
 * javascript object.
 */

// YOURNAME:
// YOURCOMMENT
function createTable(tableName, colspec, indices) {
  if (doesTableExist(tableName)) {
    return;
  }

  var stmnt = "CREATE TABLE "+_bq(tableName)+ " (";

  // YOURNAME:
  // YOURCOMMENT
  stmnt += keys(colspec).map(function(k) { return (_bq(k) + ' ' + colspec[k]); }).join(', ');
  if (indices) {

    // YOURNAME:
    // YOURCOMMENT
    stmnt += ', ' + keys(indices).map(function(k) { return 'INDEX (' + _bq(k) + ')'; }).join(', ');
  }
  stmnt += ')'+createTableOptions();
  _execute(stmnt);
}


// YOURNAME:
// YOURCOMMENT
function dropTable(tableName) {
  _execute("DROP TABLE "+_bq(tableName));
}


// YOURNAME:
// YOURCOMMENT
function dropAndCreateTable(tableName, colspec, indices) {
  if (doesTableExist(tableName)) {
    dropTable(tableName);
  }

  return createTable(tableName, colspec, indices);
}


// YOURNAME:
// YOURCOMMENT
function renameTable(oldName, newName) {
  _executeUpdate("RENAME TABLE "+_bq(oldName)+" TO "+_bq(newName));
}


// YOURNAME:
// YOURCOMMENT
function modifyColumn(tableName, columnName, newSpec) {
  _executeUpdate("ALTER TABLE "+_bq(tableName)+" MODIFY "+_bq(columnName)+" "+newSpec);
}


// YOURNAME:
// YOURCOMMENT
function alterColumn(tableName, columnName, alteration) {
  var q = "ALTER TABLE "+_bq(tableName)+" ALTER COLUMN "+_bq(columnName)+" "+alteration;
  _executeUpdate(q);
}


// YOURNAME:
// YOURCOMMENT
function changeColumn(tableName, columnName, newSpec) {
  var q = ("ALTER TABLE "+_bq(tableName)+" CHANGE COLUMN "+_bq(columnName)
           +" "+newSpec);
  _executeUpdate(q);
}


// YOURNAME:
// YOURCOMMENT
function addColumns(tableName, colspec) {

  // YOURNAME:
  // YOURCOMMENT
  inTransaction(function(conn) {

    // YOURNAME:
    // YOURCOMMENT
    eachProperty(colspec, function(name, definition) {
      var stmnt = "ALTER TABLE "+_bq(tableName)+" ADD COLUMN "+_bq(name)+" "+definition;
      _executeUpdate(stmnt);
    });
  });
}


// YOURNAME:
// YOURCOMMENT
function dropColumn(tableName, columnName) {
  var stmnt = "ALTER TABLE "+_bq(tableName)+" DROP COLUMN "+_bq(columnName);
  _executeUpdate(stmnt);
}


// YOURNAME:
// YOURCOMMENT
function listTables() {

  // YOURNAME:
  // YOURCOMMENT
  return withConnection(function(conn) {
    var metadata = conn.getMetaData();
    var resultSet = metadata.getTables(null, null, null, null);
    var resultArray = [];


    // YOURNAME:
    // YOURCOMMENT
    return closing(resultSet, function() {
      while (resultSet.next()) {
        resultArray.push(resultSet.getString("TABLE_NAME"));
      }
      return resultArray;
    });
  });
}


// YOURNAME:
// YOURCOMMENT
function setTableEngine(tableName, engineName) {
  var stmnt = "ALTER TABLE "+_bq(tableName)+" ENGINE="+_bq(engineName);
  _executeUpdate(stmnt);
}


// YOURNAME:
// YOURCOMMENT
function getTableEngine(tableName) {
  if (!isMysql()) {
    throw Error("getTableEngine() only supported by MySQL database type.");
  }

  var tableEngines = {};


  // YOURNAME:
  // YOURCOMMENT
  withConnection(function(conn) {
    var stmnt = "show table status";
    var pstmnt = conn.prepareStatement(stmnt);

    // YOURNAME:
    // YOURCOMMENT
    closing(pstmnt, function() {
      _qdebug(stmnt);
      var resultSet = pstmnt.executeQuery();

      // YOURNAME:
      // YOURCOMMENT
      closing(resultSet, function() {
        while (resultSet.next()) {
          var n = resultSet.getString("Name");
          var eng = resultSet.getString("Engine");
          tableEngines[n] = eng;
        }
      });
    });
  });

  return tableEngines[tableName];
}


// YOURNAME:
// YOURCOMMENT
function createIndex(tableName, columns) {
  var indexName = "idx_"+(columns.join("_"));
  var stmnt = "CREATE INDEX "+_bq(indexName)+" on "+_bq(tableName)+" (";
  stmnt += columns.map(_bq).join(", ");
  stmnt += ")";
  _executeUpdate(stmnt);
}

