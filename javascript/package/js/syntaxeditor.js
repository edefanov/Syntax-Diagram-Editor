//<script type="text/javascript">
  function onInit(editor)
  {

    // Enables guides
    mxGraphHandler.prototype.guidesEnabled = true;

      // Alt disables guides
      mxGuide.prototype.isEnabledForEvent = function(evt)
      {
        return !mxEvent.isAltDown(evt);
      };

    // Enables snapping waypoints to terminals
    mxEdgeHandler.prototype.snapToTerminals = true;

    // Defines an icon for creating new connections in the connection handler.
    // This will automatically disable the highlighting of the source vertex.
    mxConnectionHandler.prototype.connectImage = new mxImage('images/connector.gif', 16, 16);

    // Enables connections in the graph and disables
    // reset of zoom and translate on root change
    // (ie. switch between XML and graphical mode).
    editor.graph.setConnectable(false);

    // Clones the source if new connection has no target
    editor.graph.connectionHandler.setCreateTarget(true);

    // Title
    //var title = document.getElementById('title');
    //title.innerHTML = 'Syntax Diagram Editor'

    var graphContainer = document.getElementById('graph');
    var graphToolbar = document.getElementById('toolbar');
    graphContainer.style.width = window.innerWidth*0.95 - graphToolbar.getBoundingClientRect().width;
    graphContainer.style.height = window.innerHeight*0.95 - document.getElementById('header').getBoundingClientRect().height - 28 - document.getElementById('mainActions').getBoundingClientRect().height - document.getElementById('zoomActions').getBoundingClientRect().height - document.getElementById('source').getBoundingClientRect().height;
    console.log(window.innerHeight);

    var onresize = function(e) {
      //note i need to pass the event as an argument to the function
      var width = e.target.outerWidth;
      var height = e.target.outerHeight;
      graphContainer.style.width = window.innerWidth*0.95 - graphToolbar.getBoundingClientRect().width;
      graphContainer.style.height = window.innerHeight*0.95 - document.getElementById('header').getBoundingClientRect().height - document.getElementById('mainActions').getBoundingClientRect().height - document.getElementById('zoomActions').getBoundingClientRect().height;
    }
    window.addEventListener("resize", onresize);

      // Changes the zoom on mouseWheel events
    mxEvent.addMouseWheelListener(function (evt, up)
    {
        if (!mxEvent.isConsumed(evt))
        {
          if (up && document.getElementById('source').checked==false)
        {
            editor.execute('zoomIn');
        }
        else if (document.getElementById('source').checked==false)
        {
          editor.execute('zoomOut');
        }

        mxEvent.consume(evt);
        }
      });

    // Defines a new action to switch between
    // XML and graphical display
    var textNode = document.getElementById('xml');
    var graphNode = editor.graph.container;
    var sourceInput = document.getElementById('source');
    sourceInput.checked = false;

    var funct = function(editor)
    {
      if (sourceInput.checked)
      {
        graphNode.style.display = 'none';
        textNode.style.display = 'inline';

        var enc = new mxCodec();
        var node = enc.encode(editor.graph.getModel());

        textNode.value = mxUtils.getPrettyXml(node);
        textNode.originalValue = textNode.value;
        textNode.focus();
      }
      else
      {
        graphNode.style.display = '';

        if (textNode.value != textNode.originalValue)
        {
          var doc = mxUtils.parseXml(textNode.value);
          var dec = new mxCodec(doc);
          dec.decode(doc.documentElement, editor.graph.getModel());
        }

        textNode.originalValue = null;

        // Makes sure nothing is selected in IE
        if (mxClient.IS_IE)
        {
          mxUtils.clearSelection();
        }

        textNode.style.display = 'none';
        editor.execute('actualSize');
        // Moves the focus back to the graph
        editor.graph.container.focus();
      }
    };

    editor.addAction('switchView', funct);

    // Defines a new action to switch between
    // XML and graphical display
    mxEvent.addListener(sourceInput, 'click', function()
    {
      editor.execute('switchView');
    });

    // draw/hide Overlays

    var overlayInput = document.getElementById('overlayToggle');
    overlayInput.checked = true;

    var toggleOverlay = function(editor)
    {
      if (overlayInput.checked)
      {
        var parent = editor.graph.getDefaultParent();
        var containerList = editor.graph.getChildCells(parent);
        if (containerList.length > 0) {
          // going through containers
          for (var i = 0; i < containerList.length; i++) {
            // going through edges inside container
            var childCells = editor.graph.getChildEdges(containerList[i])
            for (var z = 0; z < childCells.length; z++) {
                if (editor.graph.getCellOverlays(childCells[z]) != null)
                {
                  var cOverlay = editor.graph.getCellOverlays(childCells[z])[0];
                  cOverlay.image = new mxImage('images/add.png', 28, 28);
                }
                var cellType = childCells[z].getValue();
                if (cellType.tagName == 'Connector')
                {
                    var childEdges = editor.graph.getChildEdges(childCells[z]);
                    for (var j = 0; j < childEdges.length; j++)
                    {
                      if (editor.graph.getCellOverlays(childEdges[j]) != null)
                      {
                        var cOverlay = editor.graph.getCellOverlays(childEdges[j])[0];
                        cOverlay.image = new mxImage('images/add.png', 28, 28);
                      }
                    }
                }
            }
            // getting the big vertical overlays
            var childCells = containerList[i].children;
            for (var z = 0; z < childCells.length; z++) {
              var cellStyle = childCells[z].style
              if (cellStyle == 'image;image=images/add.png;editable=0;movable=0;selectable=0;resizable=0') {
                childCells[z].visible = true;
              }
            }
          }
        }
      editor.graph.refresh();
      } else {
        var parent = editor.graph.getDefaultParent();
        var cellList = editor.graph.model.getChildCount(parent);
        if (cellList > 0) {
          // going through containers
          var containerList = editor.graph.getChildCells(parent);
          for (var i = 0; i < cellList; i++) {
            // going through object inside container
            var childCells = editor.graph.getChildEdges(containerList[i])
            for (var z = 0; z < childCells.length; z++)
            {
              if (editor.graph.getCellOverlays(childCells[z]) != null)
              {
                var cOverlay = editor.graph.getCellOverlays(childCells[z])[0];
                cOverlay.image = new mxImage('images/add.png', 0, 0);
              }
              var cellType = childCells[z].getValue();
              if (cellType.tagName == 'Connector')
              {
                  var childEdges = editor.graph.getChildEdges(childCells[z]);
                  for (var j = 0; j < childEdges.length; j++)
                  {
                    if (editor.graph.getCellOverlays(childEdges[j]) != null)
                    {
                      var cOverlay = editor.graph.getCellOverlays(childEdges[j])[0];
                      cOverlay.image = new mxImage('images/add.png', 0, 0);
                    }
                  }
              }
            }
            // getting the big vertical overlays
            var childCells = containerList[i].children;
            for (var z = 0; z < childCells.length; z++) {
              var cellStyle = childCells[z].style
              if (cellStyle == 'image;image=images/add.png;editable=0;movable=0;selectable=0;resizable=0') {
                childCells[z].visible = false;
              }
            }
          }
        }
      editor.graph.refresh();
    }};

    editor.addAction('toggleOverlay', toggleOverlay);

    // sets a new action to toggle control overlays
    mxEvent.addListener(overlayInput, 'click', function()
    {
      editor.execute('toggleOverlay');
    });

    // overlay toggle wrapper for context pop up
    var popupOverlayToggle = function()
    {
      if (overlayInput.checked)
      {
        overlayInput.checked = false;
      } else {
        overlayInput.checked = true;
      }
      editor.execute('toggleOverlay');
    }

    editor.addAction('popupOverlayToggle', popupOverlayToggle);


    // Create select actions in page
    var node = document.getElementById('mainActions');
    var buttons = ['new', 'open', 'savelocal', 'save', 'exportWindow', 'cut', 'copy', 'paste', 'delete', 'undo', 'redo', 'print'];

    // add openlocal if there is a state in localstorage
    if (localStorage.getItem('state') != null)
    {
      buttons.splice(3, 0, 'openlocal');
    }


    // save state to local storage function
    var saveToLocal = function()
    {
      var encoder = new mxCodec();
      var result = encoder.encode(editor.graph.getModel());
      var state = mxUtils.getXml(result);
      localStorage.setItem('state', state);
    }

    // retrieve the state from local storage
    var loadFromLocal = function()
    {
      editor.graph.getModel().clear();
      var xmlString = localStorage.getItem('state');
      var doc = mxUtils.parseXml(xmlString);
      var codec = new mxCodec(doc);
      codec.decode(doc.documentElement, editor.graph.getModel());
      populateOverlays();
    }

    // create new document function
    var newDoc = function()
    {
      window.open(window.location.href, '_blank');
    }

    // save xml file function
    var saveDialog = function()
    {
      var fileName = prompt("XML File Name (without extension)", "filename");
      if (fileName != null && fileName.length < 255 && fileName.length > 0)
      {
        if (fileName.indexOf('.xml') == -1 || fileName.indexOf('.xml') != fileName.length-5)
        {
          fileName = fileName + '.xml';
        }
      }
      if (fileName)
      {
        var encoder = new mxCodec();
        var result = encoder.encode(editor.graph.getModel());
        var fileContent = mxUtils.getXml(result);
        var blob = new Blob([fileContent], {type: "text/xml;charset=utf-8"});
        var xmlUrl = URL.createObjectURL(blob);
        var downloadLink = document.createElement("a");
        downloadLink.href = xmlUrl;
        downloadLink.download = fileName;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    }

    // open xml file function
    var openDialog = function()
    {
      var fileInputDialog = document.getElementById('file-input');
      fileInputDialog.onchange = function(event) {
        var file = fileInputDialog.files[0];
        if (file)
        {
          var reader = new FileReader();
          reader.onload = function(event)
          {
            editor.graph.getModel().clear();
            var xmlString = reader.result;
            var doc = mxUtils.parseXml(xmlString);
            var codec = new mxCodec(doc);
            codec.decode(doc.documentElement, editor.graph.getModel());
            populateOverlays();
          }
          reader.readAsText(file);
        }
      }
      fileInputDialog.click();
    }

    // export dialog function
    var exportDlg = null;
    var exportDialog = function()
    {
      if (exportDlg)
      {
        exportDlg.destroy();
      }
      var btnHeight = Math.floor(250 / 7);
      var tb = document.createElement('div');
      var html = `<table id='exportDlgTable' width=90% align="center">
                    <tr>
                      <td style="padding-top:12px;padding-bottom:12px">
                        File Name
                      </td><td style="padding-top:12px;padding-bottom:12px">
                        <input style="display:table-cell;width:100%;" id='fileName'></input>
                      </td>
                    </tr><tr>
                      <td style="padding-top:12px;padding-bottom:12px">
                        File Format
                      </td><td style="padding-top:12px;padding-bottom:12px">
                        <select id='fileFormat' style="display:table-cell;width:100%;">
                        <option value="png">PNG</option>
                        <option value="jpeg">JPEG</option>
                        <option value="bmp">BMP</option>
                        <option value="svg">SVG</option>
                        </select>
                      </td>
                    </tr><tr>
                      <td style="padding-top:12px;padding-bottom:12px"></td><td style="padding-top:12px;padding-bottom:12px">
                        <button style='float:right;margin-left:12px;height:35px;width:60px' id='exportcBtn'>Cancel</button>
                        <button style='float:right;height:35px;width:60px;background:#4b8cf7;color:#ffffff;border-color:#3079ed;' id='exportBtn'>Export</button>
                      </td>
                    </tr>
                  </table>`;
      tb.innerHTML = html;
      var dlgX = document.getElementById('exportWindow').getBoundingClientRect().left;
      var dlgY = document.getElementById('exportWindow').getBoundingClientRect().bottom;
      exportDlg = new mxWindow('Export Dialog', tb, dlgX, dlgY, 300, undefined, true, true, undefined);
      exportDlg.setClosable(true);
      exportDlg.setMinimizable(false);
      exportDlg.setVisible(true);
      document.getElementById('exportWindow').disabled = true;
      var cancelButton = document.getElementById('exportcBtn');
      cancelButton.onclick = function()
      {
        exportDlg.destroy();
        document.getElementById('exportWindow').disabled = false;
      }

      var submitButton = document.getElementById('exportBtn');
      submitButton.onclick = function()
      {
        console.log('onclick');
        var fileFormat = document.getElementById('fileFormat').value;
        var fileName = document.getElementById('fileName').value;
        if (fileName.length < 255 && fileName.length > 0)
        {
          console.log('filename got');
          overlayInput.checked = false;
          toggleOverlay(editor);
          var graph = editor.graph;
          var scale = graph.view.scale;
          var bounds = graph.getGraphBounds();
          var documentGraph = mxUtils.show(editor.graph, 'new', 0, 0, bounds.width, bounds.height);
          var svg1 = new XMLSerializer().serializeToString(documentGraph);
          var SVGCode = svg1.substring(
            svg1.indexOf("<svg"),
            svg1.indexOf("</svg>")+6
          );
          document.getElementById('exportWindow').disabled = false;
          if (fileFormat == 'svg')
          {
            var svgBlob = new Blob([SVGCode], {type:"image/svg+xml;charset=utf-8"});
            var svgUrl = URL.createObjectURL(svgBlob);
            var downloadLink = document.createElement("a");
            downloadLink.href = svgUrl;
            downloadLink.download = fileName;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            overlayInput.checked = true;
            toggleOverlay(editor);
            exportDlg.hide();
          } else if (fileFormat == 'png') {
            var canvas = document.createElement('canvas');
            canvas.width = bounds.width;
            canvas.height = bounds.height;
            console.log(canvas);
            canvg(canvas, SVGCode, {userCORS: true, ignoreDimensions: true});
            var dataURL = canvas.toDataURL('image/png');
            var data = atob(dataURL.substring('data:image/png;base64,'.length)),
              asArray = new Uint8Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) {
                asArray[i] = data.charCodeAt(i);
            }
            var pngBlob = new Blob([asArray.buffer], {type: 'image/png'});
            var pngUrl = URL.createObjectURL(pngBlob);
            var downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            downloadLink.download = fileName;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            overlayInput.checked = true;
            toggleOverlay(editor);
            exportDlg.hide();
          } else {
            var canvas = document.createElement('canvas');
            canvas.width = bounds.width;
            canvas.height = bounds.height;
            canvas.style.width = bounds.width;
            canvas.style.height = bounds.height;
            canvas.style.backgroundColor = 'rgba(255, 255, 255, 1)';
            var hdc = canvas.getContext('2d');
            hdc.fillStyle = "#ffffff";
            hdc.fillRect(0,0,canvas.width,canvas.height);
            canvas.style.opacity = '1';
            if (fileFormat == 'jpeg')
            {
              var insertP = SVGCode.indexOf('>')
              var insertString = `<rect width="100%" height="100%" fill="white"/>`
              var SVGCode = SVGCode.slice(0, insertP+1) + insertString + SVGCode.slice(insertP+1);
            }
            canvg(canvas, SVGCode, {userCORS: true, ignoreDimensions: true});
            var mimeString = 'image/' + fileFormat;
            var dataURL = canvas.toDataURL(mimeString);
            var data = atob(dataURL.substring(('data:' + mimeString + ';base64,').length)),
              asArray = new Uint8Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) {
                asArray[i] = data.charCodeAt(i);
            }
            var pngBlob = new Blob([asArray.buffer], {type: mimeString});
            var pngUrl = URL.createObjectURL(pngBlob);
            var downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            fileName = fileName + '.' + fileFormat;
            downloadLink.download = fileName;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            overlayInput.checked = true;
            toggleOverlay(editor);
            exportDlg.hide();
          }
        }
        if (!exportDlg.isVisible())
        {
          exportDlg.destroy();
        }
      }
    }

    // binding actions
    editor.addAction('openlocal', loadFromLocal);
    editor.addAction('savelocal', saveToLocal);
    editor.addAction('new', newDoc);
    editor.addAction('open', openDialog);
    editor.addAction('save', saveDialog);
    editor.addAction('exportWindow', exportDialog);

    for (var i = 0; i < buttons.length; i++)
    {
      var button = document.createElement('button');
      button.id = buttons[i];
      button.className = 'tb_buttons';
      mxUtils.write(button, mxResources.get(buttons[i]));
      var factory = function(name)
      {
        return function()
        {
          editor.execute(name);
        };
      };

      mxEvent.addListener(button, 'click', factory(buttons[i]));
      if (button.id =='cut') {
        button.style = 'margin-left:12px';
      }
      node.appendChild(button);
    }

    // Create select actions in page
    var node = document.getElementById('zoomActions');
    mxUtils.write(node, 'Zoom ');
    mxUtils.linkAction(node, 'In', editor, 'zoomIn');
    mxUtils.write(node, ', ');
    mxUtils.linkAction(node, 'Out', editor, 'zoomOut');
    mxUtils.write(node, ', ');
    mxUtils.linkAction(node, 'Actual', editor, 'actualSize');
    mxUtils.write(node, ', ');
    mxUtils.linkAction(node, 'Fit', editor, 'fit');



    // add new container toolbar button action
    editor.addAction('addNewContainer', function (editor){
      var label = prompt("Non-Terminal Name", "nonterminal");
      if (label != null) {
        var i = 0;
        label = label + ":";
        var parent = editor.graph.getDefaultParent();
        var cellList = editor.graph.model.getChildCount(parent);
        // checking if containers already exist within the graph
        if (cellList > 0) {
          var containerList = editor.graph.getChildCells(parent);
          var lowestY = 0
          // searching for the lowest container
          for (i = 0; i < containerList.length; i++) {
            if (containerList[i].style == 'swimlane') {
              var contGeoComp = containerList[i].getGeometry();
              if (contGeoComp.y + contGeoComp.height >= lowestY) {
                lowestY = contGeoComp.y + contGeoComp.height;
              }
            }
          }
          // setting the y coordinate to the lowest found
          var y = lowestY;
        } else {
          var y = 0;
        }
        var x = 0;
        var index = cellList + 1;

        // adding a container

        var template = editor.templates['container'];
        var clone = editor.graph.model.cloneCell(template);
        var cloneGeo = clone.getGeometry();
        cloneGeo.y = y;
        cloneGeo.height = 100;
        editor.graph.model.setGeometry(clone, cloneGeo);
        clone.setAttribute('label', label);
        var newContainer = editor.graph.model.add(parent, clone, index);
        editor.graph.scrollCellToVisible(newContainer);

        // refreshing the existing elements if we add a new non-terminal
        var coincd1 = 0
        var containerList = editor.graph.getChildCells(parent);
        var variables = nonTerminalsList();
        for (i = 0; i < containerList.length; i++) {
          if (containerList[i].style == 'swimlane') {
            var containerChildren = editor.graph.model.getChildCells(containerList[i]);
            for (z = 0; z < containerChildren.length; z++) {
              var cellType = containerChildren[z].getValue();
              if (cellType.tagName == 'Roundrect') {
                for (t = 0; t < variables.length; t++) {
                  var tempLabel = containerChildren[z].getAttribute('label');
                  if (tempLabel.localeCompare(variables[t]) == 0)
                  {
                    coincd1++;
                  }
                }
                if (coincd1 > 0) {
                  editor.graph.model.setStyle(containerChildren[z], 'Rect')
                }
              }
            }
          }
        }

        // adding ellipses

        template = editor.templates['shape'];
        var clone = editor.graph.model.cloneCell(template);
        index++;
        var firstEllipse = editor.graph.model.add(newContainer, clone, index);
        var clone = editor.graph.model.cloneCell(template);
        index++;
        var secondEllipse = editor.graph.model.add(newContainer, clone, index);
        var containerGeo = editor.graph.getCellGeometry(newContainer).clone();
        var firstEllipseGeo = editor.graph.getCellGeometry(firstEllipse).clone();
        var secondEllipseGeo = editor.graph.getCellGeometry(secondEllipse).clone();
        firstEllipseGeo.y = firstEllipseGeo.y + 55;
        secondEllipseGeo.y = secondEllipseGeo.y + 55;
        secondEllipseGeo.x = secondEllipseGeo.x + containerGeo.width*0.9;
        editor.graph.model.setGeometry(firstEllipse, firstEllipseGeo);
        editor.graph.model.setGeometry(secondEllipse, secondEllipseGeo);

        // connecting ellipses

        var edgeTemplate = editor.templates['connector'];
        var edgeClone = editor.graph.model.cloneCell(edgeTemplate);
        var ellipseEdge = editor.graph.addEdge(edgeClone, newContainer, firstEllipse, secondEllipse);

        // adding overlay for vertical expansion

        var vert = editor.graph.insertVertex(newContainer, null, '', (cloneGeo.width/2-25), firstEllipseGeo.y+25, 35, 35, 'image;image=images/add.png;editable=0;movable=0;selectable=0;resizable=0');


        // disabling/enabling the visibility of the control depending on the checkbox

        if (overlayInput.checked) {
          vert.visible = true;
        } else {
          vert.visible = false;
        }


        var clickedOn = new Array();
        var wnd = null;
        // add vertical elements cell overlay event
        editor.graph.addMouseListener(
        {
         currentState: null,
         mouseDown: function vertClick(sender, me)
         {
           if (this.currentState != null)
           {
             this.dragLeave(me.getEvent(), this.currentState)
           }
           if (editor.graph.model.isVertex(me.getCell()))
           {
              var cellPointer = me.getCell();
              var cellPointerGeo = editor.graph.getCellGeometry(cellPointer).clone();
              var containerGeo = editor.graph.getCellGeometry(newContainer).clone();

              // if the cell clicked on is the vertical add overlay
              if (cellPointer.style == 'image;image=images/add.png;editable=0;movable=0;selectable=0;resizable=0' && cellPointer.parent == newContainer)
              {
                // click on the add vertical elements overlay, draw red dot points between cells
                var cells = editor.graph.getChildCells(newContainer);
                var dots = []
                console.log(cells);

                // go through cells and add red dot cells to the left of each cell (only if there isnt a flat edge above the cell)
                for (var i=0; i < cells.length; i++)
                {
                  if (cells[i].value.tagName == 'Rect' || cells[i].value.tagName == 'Roundrect')
                  {
                    var flag = false;
                    var flag2 = false;
                    var checkX = cells[i].geometry.x;
                    var containerChildren = editor.graph.model.getChildren(newContainer);
                    for (z = 0; z < containerChildren.length; z++)
                    {
                      var cellType = containerChildren[z].getValue();
                      if (cellType.tagName == 'Connector')
                      {
                        var zzz = z;
                          var childEdges = editor.graph.getChildEdges(containerChildren[z]);
                          if (childEdges != undefined)
                          {
                            for (var j = 0; j < childEdges.length; j++)
                            {
                              if (checkX+cells[i].geometry.width < Math.max(childEdges[j].geometry.targetPoint.x, childEdges[j].geometry.sourcePoint.x) && checkX+cells[i].geometry.width > Math.min(childEdges[j].geometry.targetPoint.x, childEdges[j].geometry.sourcePoint.x) && childEdges[j].geometry.targetPoint.y == childEdges[j].geometry.sourcePoint.y && cells[i].geometry.y < childEdges[j].geometry.sourcePoint.y-10)
                              {
                                flag2 = true;
                              }
                              if (checkX < Math.max(childEdges[j].geometry.targetPoint.x, childEdges[j].geometry.sourcePoint.x) && checkX > Math.min(childEdges[j].geometry.targetPoint.x, childEdges[j].geometry.sourcePoint.x) && childEdges[j].geometry.targetPoint.y == childEdges[j].geometry.sourcePoint.y && cells[i].geometry.y < childEdges[j].geometry.sourcePoint.y-10)
                              {
                                flag = true;
                                break;
                              }
                            }
                          }
                      }
                    }
                    // if the cell is lower than the base connector
                    var counter = 0;
                    if (cells[i].geometry.y > containerChildren[1].geometry.y-6 && flag == false)
                    {
                      // find out the edge the cell is on
                      var childEdges = editor.graph.getChildEdges(containerChildren[2]);
                      if (childEdges != undefined)
                      {
                        for (var j = 0; j < childEdges.length; j++)
                        {
                          var leftX = Math.min(childEdges[j].geometry.targetPoint.x, childEdges[j].geometry.sourcePoint.x);
                          var rightX = Math.max(childEdges[j].geometry.targetPoint.x, childEdges[j].geometry.sourcePoint.x);
                          // found the edge cell is on
                          if (childEdges[j].geometry.targetPoint.y == childEdges[j].geometry.sourcePoint.y && childEdges[j].geometry.sourcePoint.y - 10 == cells[i].geometry.y && cells[i].geometry.x > leftX && cells[i].geometry.x+cells[i].geometry.width < rightX)
                          {
                            // find other cells on this edge
                            for (var zj = 0; zj < cells.length; zj++)
                            {
                              if (childEdges[j].geometry.sourcePoint.y - 10 == cells[zj].geometry.y && cells[zj].geometry.x > leftX && cells[zj].geometry.x+cells[zj].geometry.width < rightX && cells[i].geometry.x<cells[zj].geometry.x)
                              {
                                counter++;
                                break;
                              }
                            }
                            break;
                          }
                        }
                      }
                    }
                    if (counter == 0 && !flag2 && cells[i].geometry.y > containerChildren[1].geometry.y-6)
                    {
                      var vertO = editor.graph.insertVertex(newContainer, null, '', (cells[i].geometry.x+cells[i].geometry.width+10), cells[i].geometry.y, 20, 20, 'image;image=images/symbols/event_end.png;editable=0;movable=0;selectable=0;resizable=0');
                      dots.unshift(vertO);
                    }
                    if (!flag)
                    {
                      var vertO = editor.graph.insertVertex(newContainer, null, '', (cells[i].geometry.x-30), cells[i].geometry.y, 20, 20, 'image;image=images/symbols/event_end.png;editable=0;movable=0;selectable=0;resizable=0');
                      dots.unshift(vertO);
                      flag = false;
                    }
                  }
                }

                // // go through cells again and add red dot cells to the right of rightmost cells
                // for (var i=0; i < cellz.length; i++)
                // {
                // 	if (isRightmost(cellz, i) && cellz[i].geometry.y != firstEllipseGeo.y-6)
                // 	{
                // 		var vertO = editor.graph.insertVertex(newContainer, null, '', (cellz[i].geometry.x+cellz[i].geometry.width+10), cellz[i].geometry.y, 20, 20, 'image;image=images/symbols/event_end.png;editable=0;movable=0;selectable=0;resizable=0');
                // 		dots.unshift(vertO);
                // 	}
                // }


                // add dot to the left of right ellipse
                var vertO = editor.graph.insertVertex(newContainer, null, '', secondEllipse.geometry.x-20, secondEllipse.geometry.y-6, 20, 20, 'image;image=images/symbols/event_end.png;editable=0;movable=0;selectable=0;resizable=0');
                dots.unshift(vertO);

                // add dot to the right of left ellipse
                var vertO = editor.graph.insertVertex(newContainer, null, '', (firstEllipse.geometry.x+firstEllipse.geometry.width+10), firstEllipse.geometry.y-6, 20, 20, 'image;image=images/symbols/event_end.png;editable=0;movable=0;selectable=0;resizable=0');
                dots.unshift(vertO);


                var html = `<table height=100%> <tr> <td> <span id='vertTip'> Select the first (start) point </span> </td></tr><tr><td id='ctrlCluster'> <button style="float:bottom" id='closeBtn' style='align:right'>Cancel</button> </td></tr></table> `
                var tb = document.createElement('div');
                tb.innerHTML = html;
                wnd = new mxWindow('Tip', tb, me.getX(), me.getY(), 250, undefined, false, true);
                wnd.setLocation = function(x, y)
                 {
                   x = me.getX();
                   y = me.getY();
                   mxWindow.prototype.setLocation.apply(this, arguments);
                };

                // on "cancel" press go through the cells and delete the dots
                document.getElementById('closeBtn').onclick = function()
                {
                  for (var i=0; i < dots.length; i++)
                  {
                    editor.graph.model.remove(dots[i]);
                  }
                  wnd.destroy();
                  overlayInput.checked = true;
                  toggleOverlay(editor);
                  clickedOn.length = 0;
                };
                overlayInput.checked = false;
                toggleOverlay(editor);
                wnd.setVisible(true);
              }

              // if the cell clicked on is the dot
              if (cellPointer.style == 'image;image=images/symbols/event_end.png;editable=0;movable=0;selectable=0;resizable=0' && cellPointer.parent == newContainer)
              {

                // add the cell coordinates to the clickedOn array
                if (clickedOn.length < 4)
                {
                  clickedOn.push(cellPointerGeo.x+cellPointerGeo.width/2);
                  clickedOn.push(cellPointerGeo.y+10);
                }

                // go through the cells and remove the dot cells that are not on the same Y level if the start point is chosen
                var cells = editor.graph.getChildCells(newContainer);
                if (clickedOn.length == 2)
                {
                  for (var i=0; i < cells.length; i++)
                  {
                    if (cells[i].style == 'image;image=images/symbols/event_end.png;editable=0;movable=0;selectable=0;resizable=0' && cellPointerGeo.y != cells[i].geometry.y)
                    {
                      editor.graph.model.remove(cells[i]);
                    }
                  }
                  document.getElementById('vertTip').innerHTML = 'Select the second (end) point'
                }

                if (clickedOn.length == 4)
                {
                  for (var i=0; i < cells.length; i++)
                  {
                    if (cells[i].style == 'image;image=images/symbols/event_end.png;editable=0;movable=0;selectable=0;resizable=0')
                    {
                      editor.graph.model.remove(cells[i]);
                    }
                  }
                  var bottomY = firstEllipse.geometry.y + firstEllipse.geometry.height/2 + 30;

                  // find the lowest Y in the specified X range
                  var containerChildren = editor.graph.model.getChildren(newContainer);
                  for (i = 0; i < containerChildren.length; i++)
                  {
                    var cellType = containerChildren[i].getValue();
                    if (cellType.tagName == 'Connector')
                    {
                        var childEdges = editor.graph.getChildEdges(containerChildren[i]);
                        if (childEdges != undefined)
                        {
                          for (var j = 0; j < childEdges.length; j++)
                          {
                            if (childEdges[j].geometry.sourcePoint.y == childEdges[j].geometry.targetPoint.y && childEdges[j].geometry.targetPoint.y >= bottomY)
                            {
                                if (childEdges[j].geometry.sourcePoint.x >= clickedOn[0] && childEdges[j].geometry.targetPoint.x <= clickedOn[2])
                                {
                                  bottomY = childEdges[j].geometry.targetPoint.y;
                                } else if (childEdges[j].geometry.targetPoint.x >= clickedOn[0] && childEdges[j].geometry.sourcePoint.x <= clickedOn[2]) {
                                  bottomY = childEdges[j].geometry.targetPoint.y;
                                }
                            }
                          }
                        }
                    }
                  }
                  var setY = bottomY + 30;

                  // determine special conditions (specialCase == 1 if the target and source are the same point, == 2 if source > target)
                  var specialCase = 0;
                  if (clickedOn[0] == clickedOn[2] && clickedOn[1] == clickedOn[3])
                  {
                    specialCase = 1;
                  }
                  if (clickedOn[0] > clickedOn[2])
                  {
                    specialCase = 2;
                    var tmp = clickedOn[0];
                    clickedOn[0] = clickedOn[2];
                    clickedOn[2] = tmp;
                  }

                  var pointOffset = 30;
                  // left line
                  var cellE = new mxCell('edge', new mxGeometry(0, 0, 50, 50), 'curved=0;endArrow=classic;html=1;');
                  if (specialCase == 0)
                  {
                    cellE.geometry.setTerminalPoint(new mxPoint(clickedOn[0], clickedOn[1]), true);
                    cellE.geometry.setTerminalPoint(new mxPoint(clickedOn[0]+pointOffset, setY), false);
                  } else if (specialCase == 1) {
                    cellE.geometry.setTerminalPoint(new mxPoint(clickedOn[0], clickedOn[1]), true);
                    cellE.geometry.setTerminalPoint(new mxPoint(clickedOn[0]+pointOffset, setY), false);
                  } else if (specialCase == 2) {
                    cellE.geometry.setTerminalPoint(new mxPoint(clickedOn[0], clickedOn[1]), false);
                    cellE.geometry.setTerminalPoint(new mxPoint(clickedOn[0]+pointOffset, setY), true);
                    cellE.setStyle('curved=0;endArrow=none;html=1;')
                  }
                  cellE.edge = true;
                  cellE = editor.graph.addCell(cellE, ellipseEdge);
                  editor.graph.fireEvent(new mxEventObject('cellsInserted', 'cells', [cellE]));

                  // right line
                  var cellE2 = new mxCell('edge', new mxGeometry(0, 0, 50, 50), 'curved=0;endArrow=classic;html=1;');
                  if (specialCase == 0)
                  {
                    cellE2.geometry.setTerminalPoint(new mxPoint(clickedOn[2]-pointOffset, setY), true);
                    cellE2.geometry.setTerminalPoint(new mxPoint(clickedOn[2], clickedOn[3]), false);
                  } else if (specialCase == 1) {
                    cellE2.geometry.setTerminalPoint(new mxPoint(clickedOn[2]-pointOffset, setY), false);
                    cellE2.geometry.setTerminalPoint(new mxPoint(clickedOn[2], clickedOn[3]), true);
                  } else if (specialCase == 2) {
                    cellE2.geometry.setTerminalPoint(new mxPoint(clickedOn[2]-pointOffset, setY), false);
                    cellE2.geometry.setTerminalPoint(new mxPoint(clickedOn[2], clickedOn[3]), true);
                  }
                  cellE2.edge = true;
                  cellE2 = editor.graph.addCell(cellE2, ellipseEdge);
                  editor.graph.fireEvent(new mxEventObject('cellsInserted', 'cells', [cellE2]));

                  // middle flat line
                  var cellE3 = new mxCell('edge', new mxGeometry(0, 0, 50, 50), 'curved=0;endArrow=classic;html=1;');
                  if (specialCase == 0)
                  {
                    cellE3.geometry.setTerminalPoint(new mxPoint(clickedOn[0]+pointOffset, setY), true);
                    cellE3.geometry.setTerminalPoint(new mxPoint(clickedOn[2]-pointOffset, setY), false);
                  } else if (specialCase == 1) {
                    cellE3.geometry.setTerminalPoint(new mxPoint(clickedOn[0]+pointOffset, setY), true);
                    cellE3.geometry.setTerminalPoint(new mxPoint(clickedOn[2]-pointOffset, setY), false);
                  } else if (specialCase == 2) {
                    cellE3.geometry.setTerminalPoint(new mxPoint(clickedOn[0]+pointOffset, setY), false);
                    cellE3.geometry.setTerminalPoint(new mxPoint(clickedOn[2]-pointOffset, setY), true);
                  }
                  cellE3.edge = true;
                  cellE3 = editor.graph.addCell(cellE3, ellipseEdge);
                  editor.graph.fireEvent(new mxEventObject('cellsInserted', 'cells', [cellE3]));


                  // find lowest Y and move the overlay itself
                  var overlayY = 0;
                  for (i = 0; i < containerChildren.length; i++)
                  {
                    var cellType = containerChildren[i].getValue();
                    if (cellType.tagName == 'Connector')
                    {
                        var childEdges = editor.graph.getChildEdges(containerChildren[i]);
                        if (childEdges != undefined)
                        {
                          for (var j = 0; j < childEdges.length; j++)
                          {
                            if (childEdges[j].geometry.sourcePoint.y == childEdges[j].geometry.targetPoint.y && childEdges[j].geometry.targetPoint.y >= bottomY)
                            {
                              overlayY = childEdges[j].geometry.targetPoint.y;
                            }
                          }
                        }
                    }
                  }
                  var vertGeo = vert.geometry;
                  vertGeo.y = overlayY + 50;
                  editor.graph.model.setGeometry(vert, vertGeo);

                  // resizing the container
                  var containerGeo = editor.graph.getCellGeometry(newContainer).clone();
                  containerGeo.height = vertGeo.y + vertGeo.height;
                  editor.graph.model.setGeometry(newContainer, containerGeo);
                  // variables to use later to determine where to place new cells
                  var cellE3G = cellE3.geometry;
                  var cellEG = cellE.geometry;
                  var cellE2G = cellE2.geometry;

                  // set up variables for later use
                  if (specialCase == 0)
                  {
                    var cellEsource = {
                      x : cellEG.sourcePoint.x,
                      y : cellEG.sourcePoint.y
                    };
                    var cellEtarget = {
                      x : cellEG.targetPoint.x,
                      y : cellEG.targetPoint.y
                    };
                    var cellE2source = {
                      x : cellE2G.sourcePoint.x,
                      y : cellE2G.sourcePoint.y
                    };
                    var cellE2target = {
                      x : cellE2G.targetPoint.x,
                      y : cellE2G.targetPoint.y
                    };
                    var cellE3source = {
                      x : cellE3.geometry.sourcePoint.x,
                      y : cellE3.geometry.sourcePoint.y
                    };
                    var cellE3target = {
                      x : cellE3.geometry.targetPoint.x,
                      y : cellE3.geometry.targetPoint.y
                    };
                  } else if (specialCase == 1) {
                    var cellEsource = {
                      x : cellEG.sourcePoint.x,
                      y : cellEG.sourcePoint.y
                    };
                    var cellEtarget = {
                      x : cellEG.targetPoint.x,
                      y : cellEG.targetPoint.y
                    };
                    var cellE2source = {
                      x : cellE2G.sourcePoint.x,
                      y : cellE2G.sourcePoint.y
                    };
                    var cellE2target = {
                      x : cellE2G.targetPoint.x,
                      y : cellE2G.targetPoint.y
                    };
                    var cellE3source = {
                      x : cellE3.geometry.sourcePoint.x,
                      y : cellE3.geometry.sourcePoint.y
                    };
                    var cellE3target = {
                      x : cellE3.geometry.targetPoint.x,
                      y : cellE3.geometry.targetPoint.y
                    };
                  } else if (specialCase == 2) {
                    var cellEsource = {
                      x : cellEG.targetPoint.x,
                      y : cellEG.targetPoint.y
                    };
                    var cellEtarget = {
                      x : cellEG.sourcePoint.x,
                      y : cellEG.sourcePoint.y
                    };
                    var cellE2source = {
                      x : cellE2G.targetPoint.x,
                      y : cellE2G.targetPoint.y
                    };
                    var cellE2target = {
                      x : cellE2G.sourcePoint.x,
                      y : cellE2G.sourcePoint.y
                    };
                    var cellE3source = {
                      x : cellE3.geometry.targetPoint.x,
                      y : cellE3.geometry.targetPoint.y
                    };
                    var cellE3target = {
                      x : cellE3.geometry.sourcePoint.x,
                      y : cellE3.geometry.sourcePoint.y
                    };
                  }

                  // adding overlay to add elements to the line
                  if (overlayInput.checked) {
                    var overlayV = new mxCellOverlay(new mxImage('images/add.png', 28, 28), 'Add New Element');
                  } else {
                    var overlayV = new mxCellOverlay(new mxImage('images/add.png', 0, 0), 'Add New Element');
                  }
                  overlayV.cursor = 'hand';
                  // overlayV.offset.x = (clickedOn[2]-clickedOn[0] - 60)/2
                  if (specialCase == 0)
                  {
                    overlayV.offset.x = (cellE2target.x-cellEtarget.x - 60)/2;
                    console.log('specialcase 0 overlay offset = ', (cellE2target.x-cellEtarget.x - 60)/2);
                  } else if (specialCase == 2) {
                    overlayV.offset.x = (cellE2target.x-cellEtarget.x - 60)/2;
                    console.log('specialcase 2 overlay offset', ((cellE2target.x-cellEtarget.x - 60)/2));
                  }

                  editor.graph.addCellOverlay(cellE3, overlayV);

                  // overlay click action
                  overlayV.addListener(mxEvent.CLICK, function horClick1(sender, evt2)
                  {
                    if (specialCase == 0)
                    {
                      var cellEsource = {
                        x : cellE.geometry.sourcePoint.x,
                        y : cellE.geometry.sourcePoint.y
                      };
                      var cellEtarget = {
                        x : cellE.geometry.targetPoint.x,
                        y : cellE.geometry.targetPoint.y
                      };
                      var cellE2source = {
                        x : cellE2.geometry.sourcePoint.x,
                        y : cellE2.geometry.sourcePoint.y
                      };
                      var cellE2target = {
                        x : cellE2.geometry.targetPoint.x,
                        y : cellE2.geometry.targetPoint.y
                      };
                      var cellE3source = {
                        x : cellE3.geometry.sourcePoint.x,
                        y : cellE3.geometry.sourcePoint.y
                      };
                      var cellE3target = {
                        x : cellE3.geometry.targetPoint.x,
                        y : cellE3.geometry.targetPoint.y
                      };
                    } else if (specialCase == 2) {
                      var cellEsource = {
                        x : cellE.geometry.targetPoint.x,
                        y : cellE.geometry.targetPoint.y
                      };
                      var cellEtarget = {
                        x : cellE.geometry.sourcePoint.x,
                        y : cellE.geometry.sourcePoint.y
                      };
                      var cellE2source = {
                        x : cellE2.geometry.targetPoint.x,
                        y : cellE2.geometry.targetPoint.y
                      };
                      var cellE2target = {
                        x : cellE2.geometry.sourcePoint.x,
                        y : cellE2.geometry.sourcePoint.y
                      };
                      var cellE3source = {
                        x : cellE3.geometry.targetPoint.x,
                        y : cellE3.geometry.targetPoint.y
                      };
                      var cellE3target = {
                        x : cellE3.geometry.sourcePoint.x,
                        y : cellE3.geometry.sourcePoint.y
                      };
                    }
                    editor.graph.clearSelection();
                    var labelNewStringV = prompt("New Element Name", "Enter here");
                    var coincd = 0;
                    variables = nonTerminalsList();
                    if (labelNewStringV != null) {
                      for (i = 0; i < variables.length; i++) {
                        if (labelNewStringV.localeCompare(variables[i]) == 0)
                        {
                          coincd++;
                        }
                      }
                      if (coincd > 0) {
                        var stringTemplate = editor.templates['rectangle'];
                      } else {
                        var stringTemplate = editor.templates['rounded'];
                      }
                      var stringClone = editor.graph.model.cloneCell(stringTemplate);
                      stringClone.setAttribute('label', labelNewStringV);
                      // getting text width and resizing the rectangle if needed
                      var contGeo = stringClone.getGeometry();
                      contGeo.width = Math.round(getTextWidth(labelNewStringV, '11px arial')) + 30;
                      editor.graph.model.setGeometry(stringClone, contGeo);

                      // searching for far right cell x coordinate
                      var elemLine = new Array();
                      var containerChildren = editor.graph.model.getChildren(newContainer);
                      console.log(containerChildren);
                      console.log(cellEtarget.x);
                      var farRightX = cellEtarget.x;
                      for (i = 0; i < containerChildren.length; i++)
                      {
                        console.log('checking cell', containerChildren[i]);
                        console.log('farRightx', farRightX);
                        var cellType = containerChildren[i].getValue();
                        if (cellType.tagName == 'Rect' || cellType.tagName == 'Roundrect')
                        {
                          var geoCompare = containerChildren[i].getGeometry();
                          if (geoCompare.x >= cellEtarget.x && geoCompare.y == (cellE3source.y-10) && geoCompare.x <= cellE2source.x)
                          {
                            if ((geoCompare.x + geoCompare.width) >= farRightX)
                            {
                              farRightX = geoCompare.x + geoCompare.width;
                              var geoCompareF = geoCompare;
                            }
                            elemLine.push(containerChildren[i]);
                          }
                        }
                      }

                      // adding the cell and moving it
                      var stringRectangle = editor.graph.model.add(newContainer, stringClone, index);
                      var stringRectangleGeo = editor.graph.getCellGeometry(stringRectangle).clone();
                      stringRectangleGeo.height = 20;
                      stringRectangleGeo.y = cellE3source.y-10;
                      if (typeof geoCompareF != "undefined") {
                        // if there are cells on this Y level add up widths of the elements
                        var lengthSum = 40;
                        for (i=0; i < elemLine.length; i++)
                        {
                          lengthSum += elemLine[i].getGeometry().width + 40;
                        }
                        lengthSum += stringRectangleGeo.width;
                        // compare it to to the width of the line
                        if (lengthSum > Math.abs(cellE3target.x - cellE3source.x))
                        {
                          // have to extend the line and the parent line, possibly  adjust the other lines as well
                          for (i=0; i<containerChildren.length; i++)
                          {
                            // if rectangle and to the right move further to the right
                            var cellType = containerChildren[i].getValue();
                            if (cellType.tagName == 'Rect' || cellType.tagName == 'Roundrect')
                            {
                              if (containerChildren[i].geometry.x >= cellE3target.x)
                              {
                                var currCellGeo = containerChildren[i].geometry;
                                currCellGeo.x += stringRectangleGeo.width+40;
                                editor.graph.model.setGeometry(containerChildren[i], currCellGeo);
                              }
                            }
                          }
                          for (i=0; i<containerChildren.length; i++)
                          {
                            // if ellipse move to the right
                            var cellStyle = containerChildren[i].getStyle();
                            if (cellStyle == 'ellipse')
                            {
                              if (containerChildren[i].geometry.x > cellE3target.x)
                              {
                                var currCellGeo = containerChildren[i].geometry;
                                currCellGeo.x += stringRectangleGeo.width+40;
                                editor.graph.model.setGeometry(containerChildren[i], currCellGeo);
                              }
                            }
                            // moving the edge(s) to the right
                            var compTargetX = cellE3target.x;
                            var cellType = containerChildren[i].getValue();
                            if (cellType.tagName == 'Connector')
                            {
                              var childEdges = editor.graph.getChildEdges(containerChildren[i]);
                              for (var j = 0; j < childEdges.length; j++)
                              {
                                if (childEdges[j].geometry.sourcePoint.x >= compTargetX)
                                {
                                  var cEdgesGeo = childEdges[j].geometry;
                                  cEdgesGeo.sourcePoint.x += stringRectangleGeo.width+40;
                                  editor.graph.model.setGeometry(childEdges[j], cEdgesGeo);
                                  if (editor.graph.getCellOverlays(childEdges[j]) != null)
                                  {
                                    var cOverlay = editor.graph.getCellOverlays(childEdges[j])[0];
                                    cOverlay.image = new mxImage('images/add.png', 28, 28);
                                    cOverlay.offset.x = Math.abs((cEdgesGeo.targetPoint.x - cEdgesGeo.sourcePoint.x) / 2);
                                  }
                                }
                                if (childEdges[j].geometry.targetPoint.x >= compTargetX) {
                                  var cEdgesGeo = childEdges[j].geometry;
                                  cEdgesGeo.targetPoint.x += stringRectangleGeo.width+40;
                                  editor.graph.model.setGeometry(childEdges[j], cEdgesGeo);
                                  if (editor.graph.getCellOverlays(childEdges[j]) != null)
                                  {
                                    var cOverlay = editor.graph.getCellOverlays(childEdges[j])[0];
                                    cOverlay.image = new mxImage('images/add.png', 28, 28);
                                    cOverlay.offset.x = Math.abs((cEdgesGeo.targetPoint.x - cEdgesGeo.sourcePoint.x) / 2);
                                  }
                                }
                              }
                            }
                          }
                          stringRectangleGeo.x = farRightX + 40;
                        } else {
                          // dont have to extend the line, just add to the right
                          stringRectangleGeo.x = farRightX + 40;
                        }
                      } else {
                        // if there are no cells on this Y level check the line length, extend it if needed and then put the cell on the leftmost point
                        if (stringRectangleGeo.width+20 > Math.abs(cellE3G.targetPoint.x - cellE3G.sourcePoint.x))
                        {
                          var containerChildren = editor.graph.model.getChildren(newContainer);
                          for (i=0; i<containerChildren.length; i++)
                          {
                            // if rectangle and to the right move further to the right
                            var cellType = containerChildren[i].getValue();
                            if (cellType.tagName == 'Rect' || cellType.tagName == 'Roundrect')
                            {
                              if (containerChildren[i].geometry.x >= cellE3target.x)
                              {
                                var currCellGeo = containerChildren[i].geometry;
                                currCellGeo.x += stringRectangleGeo.width+10;
                                editor.graph.model.setGeometry(containerChildren[i], currCellGeo);
                              }
                            }
                          }
                          for (i=0; i<containerChildren.length; i++)
                          {
                            // if ellipse move to the right
                            var cellStyle = containerChildren[i].getStyle();
                            if (cellStyle == 'ellipse')
                            {
                              if (containerChildren[i].geometry.x > cellE3target.x)
                              {
                                var currCellGeo = containerChildren[i].geometry;
                                currCellGeo.x += stringRectangleGeo.width+10;
                                editor.graph.model.setGeometry(containerChildren[i], currCellGeo);
                              }
                            }
                            // moving the edge(s) to the right
                            var compTargetX = cellE3target.x;
                            var cellType = containerChildren[i].getValue();
                            if (cellType.tagName == 'Connector')
                            {
                              var childEdges = editor.graph.getChildEdges(containerChildren[i]);
                              for (var j = 0; j < childEdges.length; j++)
                              {
                                if (childEdges[j].geometry.sourcePoint.x >= compTargetX )
                                {
                                  var cEdgesGeo = childEdges[j].geometry;
                                  cEdgesGeo.sourcePoint.x += stringRectangleGeo.width+10;
                                  editor.graph.model.setGeometry(childEdges[j], cEdgesGeo);
                                  if (editor.graph.getCellOverlays(childEdges[j]) != null)
                                  {
                                    var cOverlay = editor.graph.getCellOverlays(childEdges[j])[0];
                                    cOverlay.image = new mxImage('images/add.png', 28, 28);
                                    cOverlay.offset.x = Math.abs((cEdgesGeo.targetPoint.x - cEdgesGeo.sourcePoint.x) / 2);
                                  }
                                }
                                if (childEdges[j].geometry.targetPoint.x >= compTargetX ) {
                                  var cEdgesGeo = childEdges[j].geometry;
                                  cEdgesGeo.targetPoint.x += stringRectangleGeo.width+10;
                                  editor.graph.model.setGeometry(childEdges[j], cEdgesGeo);
                                  if (editor.graph.getCellOverlays(childEdges[j]) != null)
                                  {
                                    var cOverlay = editor.graph.getCellOverlays(childEdges[j])[0];
                                    cOverlay.image = new mxImage('images/add.png', 28, 28);
                                    cOverlay.offset.x = Math.abs((cEdgesGeo.targetPoint.x - cEdgesGeo.sourcePoint.x) / 2);
                                  }
                                }
                              }
                            }
                          }
                        }
                        if (cellE3G.targetPoint.x > cellE3G.sourcePoint.x)
                        {
                          stringRectangleGeo.x = cellE3G.sourcePoint.x + 10;
                        } else {
                          stringRectangleGeo.x = cellE3G.targetPoint.x + 10;
                        }
                      }
                      editor.graph.model.setGeometry(stringRectangle, stringRectangleGeo);

                      // resizing container to the right (using the far right coordinate + offset) and moving the right ellipse  + overlay
                      var farRightX1 = 0
                      var containerChildren = editor.graph.model.getChildren(newContainer);
                      for (i = 0; i < containerChildren.length; i++)
                      {
                        var geoCompare1 = containerChildren[i].getGeometry();
                        if (geoCompare1.x > farRightX1)
                        {
                          farRightX1 = geoCompare1.x + geoCompare1.width;
                        }
                      }
                      var containerGeo = newContainer.getGeometry();
                      containerGeo.width = farRightX1;
                      editor.graph.model.setGeometry(newContainer, containerGeo);

                      // moving the add level overlay to container/2
                      for (i = 0; i < containerChildren.length; i++)
                      {
                        var cellStyle = containerChildren[i].getStyle();
                        if (cellStyle == 'image;image=images/add.png;editable=0;movable=0;selectable=0;resizable=0')
                        {
                          var vertGeo = containerChildren[i].getGeometry();
                          vertGeo.x = vertGeo.x = Math.round(containerGeo.width / 2) - vertGeo.width/2;
                          editor.graph.model.setGeometry(containerChildren[i], vertGeo);
                          break;
                        }
                      }
                      editor.graph.refresh();
                    }
                  });
                  clickedOn.length = 0;
                  wnd.destroy();
                  overlayInput.checked = true;
                  toggleOverlay(editor);
                  realignNonTerminals();
                }
              }
           }
         },
         mouseMove: function(sender, me)
         {},
         mouseUp: function(sender, me)
         {},
         dragEnter: function(evt, state)
         {},
         dragLeave: function(evt, state)
         {}
       });

        // adding overlays - add button

        if (overlayInput.checked) {
          var overlay = new mxCellOverlay(new mxImage('images/add.png', 28, 28), 'Add New Element');
        } else {
          var overlay = new mxCellOverlay(new mxImage('images/add.png', 0, 0), 'Add New Element');
        }
        overlay.cursor = 'hand';
        editor.graph.addCellOverlay(ellipseEdge, overlay);

        // add new element overlay click event

        overlay.addListener(mxEvent.CLICK, function(sender, evt2)
        {
          editor.graph.clearSelection();
          var labelNewString = prompt("New Element Name", "Enter here");
          var coincd = 0;
          if (labelNewString != null) {
            for (i = 0; i < variables.length; i++) {
              if (labelNewString.localeCompare(variables[i]) == 0)
              {
                coincd++;
              }
            }
            if (coincd > 0) {
              var stringTemplate = editor.templates['rectangle'];
            } else {
              var stringTemplate = editor.templates['rounded'];
            }
            var stringClone = editor.graph.model.cloneCell(stringTemplate);
            stringClone.setAttribute('label', labelNewString);
            // getting text width and resizing the rectangle if needed
            var contGeo = stringClone.getGeometry();
            if (labelNewString.length == 1)
            {
              contGeo.width = Math.round(getTextWidth(labelNewString, '11px arial')) + 10;
            } else {
              contGeo.width = Math.round(getTextWidth(labelNewString, '11px arial')) + 30;
            }
            editor.graph.model.setGeometry(stringClone, contGeo);

            // searching for far right cell x coordinate
            var containerChildren = editor.graph.model.getChildren(newContainer);
            var farRightX = 0;
            for (i = 0; i < containerChildren.length; i++) {
              var cellType = containerChildren[i].getValue();
              if (cellType.tagName == 'Rect' || cellType.tagName == 'Roundrect') {
                var geoCompare = containerChildren[i].getGeometry();
                if (geoCompare.x > farRightX && geoCompare.y == secondEllipseGeo.y-6) {
                  farRightX = geoCompare.x + geoCompare.width;
                  var geoCompareF = geoCompare;
                }
              }
            }
            // searching for far right edge point
            for (i = 0; i < containerChildren.length; i++)
            {
              var cellType = containerChildren[i].getValue();
              if (cellType.tagName == 'Connector')
              {
                var childEdges = editor.graph.getChildEdges(containerChildren[i]);
                for (var j = 0; j < childEdges.length; j++)
                {
                  if (childEdges[j].geometry.sourcePoint.x > farRightX)
                  {
                    farRightX = childEdges[j].geometry.sourcePoint.x;
                  }
                  if (childEdges[j].geometry.targetPoint.x > farRightX)
                  {
                    farRightX = childEdges[j].geometry.targetPoint.x;
                  }
                }
                break;
              }
            }

            // adding the cell and moving it
            var stringRectangle = editor.graph.model.add(newContainer, stringClone, index);
            var stringRectangleGeo = editor.graph.getCellGeometry(stringRectangle).clone();
            stringRectangleGeo.height = 20;
            stringRectangleGeo.y = secondEllipseGeo.y-6;
            if (typeof geoCompare != "undefined"){
              stringRectangleGeo.x = farRightX + 40;
            } else {
              stringRectangleGeo.x = firstEllipseGeo.x + firstEllipseGeo.width + 40;
            }
            editor.graph.model.setGeometry(stringRectangle, stringRectangleGeo);

            // resizing container to the right (using the far right coordinate + offset) and moving the right ellipse  + overlay
            var farRightX1 = 0
            var containerChildren1 = editor.graph.model.getChildren(newContainer);
            console.log(containerChildren1);
            for (i = 0; i < containerChildren1.length; i++) {
              var geoCompare1 = containerChildren[i].geometry;
                  if (geoCompare1.x+geoCompare1.width > farRightX1) {
                    farRightX1 = geoCompare1.x + geoCompare1.width;
                    console.log('farrightx1', farRightX1);
                    console.log('far right cell', geoCompare1);
                  }
            }
            var containerGeo = newContainer.geometry;
            containerGeo.width = farRightX1*1.15;
            secondEllipseGeo.x = containerGeo.width-10;
            editor.graph.model.setGeometry(secondEllipse, secondEllipseGeo);
            editor.graph.model.setGeometry(newContainer, containerGeo);

            // moving the vertical expansion overlay to container/2
            var vertGeo = editor.graph.getCellGeometry(vert).clone();
            vertGeo.x = Math.round(containerGeo.width / 2) - vertGeo.width/2;
            editor.graph.model.setGeometry(vert, vertGeo);
            editor.graph.refresh();
          }

        });

        overlay.getBounds = function(state)
        {
          var bounds = mxCellOverlay.prototype.getBounds.apply(this, arguments);

          if (state.view.graph.getModel().isEdge(state.cell))
          {
            var pt = state.view.getPoint(state, {x: 1, y: 0, relative: true});
            bounds.x = pt.x - bounds.width / 2;
            bounds.y = pt.y - bounds.height / 2;
          }

          return bounds;
        };



        // @todo:
        // !!!DONE!!! re-align non-terminals
        // !!!DONE!!! add overlay toggle
        // !!!DONE!!! refactor connections - consistent distances between cells, add arrows
        // !!!DONE!!! add vertical elements editing
        // !!!DONE!!! image saving
        // !!!DONE!!! image saving through a pop up window
        // !!!KIND OF DONE!!! fix vertical functionality (single source/target and target<source)
        // !!!DONE!!! xml saving
        // !!!DONE!!! redo gui
        // !!!DONE!!! rectangle width based on text width
        // !!!DONE!!! add overlays processing to xml opening
        // !!!DONE!!! implement local storage
        // !!!DONE!!! file ierarchy and dependencies cleanup
        // !!!DONE!!! top toolbar images
        // !!!DONE!!! context menu add new container, zoom control and controls toggle
        editor.graph.refresh();
    }
  })

  //////////////////////
  //									//
  // HELPER FUNCTIONS //
  //									//
  //////////////////////

  // adds overlays to the model
  function populateOverlays()
  {
    var parent = editor.graph.getDefaultParent();
    var containerList = editor.graph.getChildCells(parent);
    for (var o1 = 0; o1 < containerList.length; o1++)
    {
      ///////////////
      //////////////
      // main edge overlay
      //////////////
      //////////////
      var ellipseEdge = editor.graph.getChildEdges(containerList[o1])[0];
      var newContainer = containerList[o1];
      var firstEllipse = editor.graph.getChildCells(containerList[o1])[0];
      var secondEllipse = editor.graph.getChildCells(containerList[o1])[1];
      var fistEllipseGeo = firstEllipse.geometry;
      var secondEllipseGeo = secondEllipse.geometry;
      var vert = getCellbyStyle(editor.graph.getChildCells(containerList[o1]), 'image;image=images/add.png;editable=0;movable=0;selectable=0;resizable=0');

      if (overlayInput.checked) {
        var overlay = new mxCellOverlay(new mxImage('images/add.png', 28, 28), 'Add New Element');
      } else {
        var overlay = new mxCellOverlay(new mxImage('images/add.png', 0, 0), 'Add New Element');
      }

      overlay.cursor = 'hand';
      editor.graph.addCellOverlay(ellipseEdge, overlay);
      var variables = nonTerminalsList();

      overlay.addListener(mxEvent.CLICK, function(sender, evt2)
      {
        editor.graph.clearSelection();
        var labelNewString = prompt("New Element Name", "Enter here");
        var coincd = 0;
        if (labelNewString != null) {
          for (i = 0; i < variables.length; i++) {
            if (labelNewString.localeCompare(variables[i]) == 0)
            {
              coincd++;
            }
          }
          if (coincd > 0) {
            var stringTemplate = editor.templates['rectangle'];
          } else {
            var stringTemplate = editor.templates['rounded'];
          }
          var stringClone = editor.graph.model.cloneCell(stringTemplate);
          stringClone.setAttribute('label', labelNewString);
          // getting text width and resizing the rectangle if needed
          var contGeo = stringClone.getGeometry();
          if (labelNewString.length == 1)
          {
            contGeo.width = Math.round(getTextWidth(labelNewString, '11px arial')) + 10;
          } else {
            contGeo.width = Math.round(getTextWidth(labelNewString, '11px arial')) + 30;
          }
          editor.graph.model.setGeometry(stringClone, contGeo);

          // searching for far right cell x coordinate
          var containerChildren = editor.graph.model.getChildren(newContainer);
          var farRightX = 0;
          for (i = 0; i < containerChildren.length; i++) {
            var cellType = containerChildren[i].getValue();
            if (cellType.tagName == 'Rect' || cellType.tagName == 'Roundrect') {
              var geoCompare = containerChildren[i].getGeometry();
              // console.log('geoCompare.x = ', geoCompare.x);
                if (geoCompare.x > farRightX && geoCompare.y == secondEllipseGeo.y-6) {
                  farRightX = geoCompare.x + geoCompare.width;
                  var geoCompareF = geoCompare;
                }
            }
          }
          // searching for far right edge point
          for (i = 0; i < containerChildren.length; i++)
          {
            var cellType = containerChildren[i].getValue();
            if (cellType.tagName == 'Connector')
            {
              var childEdges = editor.graph.getChildEdges(containerChildren[i]);
              for (var j = 0; j < childEdges.length; j++)
              {
                if (childEdges[j].geometry.sourcePoint.x > farRightX)
                {
                  farRightX = childEdges[j].geometry.sourcePoint.x;
                }
                if (childEdges[j].geometry.targetPoint.x > farRightX)
                {
                  farRightX = childEdges[j].geometry.targetPoint.x;
                }
              }
              break;
            }
          }

          // adding the cell and moving it
          var stringRectangle = editor.graph.model.add(newContainer, stringClone);
          var stringRectangleGeo = editor.graph.getCellGeometry(stringRectangle).clone();
          stringRectangleGeo.height = 20;
          // console.log('width, = ', stringRectangleGeo.width);
          stringRectangleGeo.y = secondEllipseGeo.y-6;
          if (typeof geoCompare != "undefined"){
            stringRectangleGeo.x = farRightX + 40;
          } else {
            stringRectangleGeo.x = firstEllipse.geometry.x + firstEllipse.geometry.width + 40;
          }
          editor.graph.model.setGeometry(stringRectangle, stringRectangleGeo);

          // resizing container to the right (using the far right coordinate + offset) and moving the right ellipse  + overlay
          var farRightX1 = 0
          var containerChildren1 = editor.graph.model.getChildren(newContainer);
          for (i = 0; i < containerChildren1.length; i++) {
            var geoCompare1 = containerChildren[i].getGeometry();
            if (geoCompare1.x+geoCompare1.width > farRightX1) {
              farRightX1 = geoCompare1.x + geoCompare1.width;
            }
          }
          var containerGeo = newContainer.geometry;
          containerGeo.width = farRightX1*1.15;
          secondEllipseGeo.x = containerGeo.width-10;
          editor.graph.model.setGeometry(secondEllipse, secondEllipseGeo);
          editor.graph.model.setGeometry(newContainer, containerGeo);

          // moving the vertical expansion overlay to container/2
          var vertGeo = editor.graph.getCellGeometry(vert).clone();
          vertGeo.x = Math.round(containerGeo.width / 2) - vertGeo.width/2;
          editor.graph.model.setGeometry(vert, vertGeo);
          editor.graph.refresh();
        }

      });

      overlay.getBounds = function(state)
      {
        var bounds = mxCellOverlay.prototype.getBounds.apply(this, arguments);

        if (state.view.graph.getModel().isEdge(state.cell))
        {
          var pt = state.view.getPoint(state, {x: 1, y: 0, relative: true});
          bounds.x = pt.x - bounds.width / 2;
          bounds.y = pt.y - bounds.height / 2;
        }

        return bounds;
      };

      editor.graph.refresh();

      ///////////////
      //////////////
      // additional edge overlays
      //////////////
      //////////////
      var edges = editor.graph.getChildEdges(ellipseEdge);
      for (var o2 = 0; o2 < edges.length; o2++)
      {
        if (edges[o2].geometry.sourcePoint.y == edges[o2].geometry.targetPoint.y)
        {
          var cellE3 = edges[o2];
          var cellE2 = edges[o2-1];
          var cellE = edges[o2-2];
          var cellEtarget = {
            x : Math.max(cellE.geometry.targetPoint.x, cellE.geometry.sourcePoint.x),
            y : Math.max(cellE.geometry.targetPoint.y, cellE.geometry.sourcePoint.y)
          }
          var cellEsource = {
            x : Math.min(cellE.geometry.targetPoint.x, cellE.geometry.sourcePoint.x),
            y : Math.min(cellE.geometry.targetPoint.y, cellE.geometry.sourcePoint.y)
          }
          var cellE2target = {
            x : Math.max(cellE2.geometry.targetPoint.x, cellE2.geometry.sourcePoint.x),
            y : Math.max(cellE2.geometry.targetPoint.y, cellE2.geometry.sourcePoint.y)
          }
          var cellE2source = {
            x : Math.min(cellE2.geometry.targetPoint.x, cellE2.geometry.sourcePoint.x),
            y : Math.min(cellE2.geometry.targetPoint.y, cellE2.geometry.sourcePoint.y)
          }
          var cellE3target = {
            x : Math.max(cellE3.geometry.targetPoint.x, cellE3.geometry.sourcePoint.x),
            y : cellE3.geometry.targetPoint.y
          }
          var cellE3source = {
            x : Math.min(cellE3.geometry.targetPoint.x, cellE.geometry.sourcePoint.x),
            y : cellE3.geometry.targetPoint.y
          }
          if (overlayInput.checked) {
            var overlayV = new mxCellOverlay(new mxImage('images/add.png', 28, 28), 'Add New Element');
          } else {
            var overlayV = new mxCellOverlay(new mxImage('images/add.png', 0, 0), 'Add New Element');
          }
          overlayV.cursor = 'hand';
          overlayV.offset.x = (cellE2target.x-cellEtarget.x - 60)/2;

          editor.graph.addCellOverlay(cellE3, overlayV);

          overlayV.addListener(mxEvent.CLICK, function horClick1(sender, evt2)
          {
            editor.graph.clearSelection();
            var labelNewStringV = prompt("New Element Name", "Enter here");
            var coincd = 0;
            variables = nonTerminalsList();
            if (labelNewStringV != null) {
              for (i = 0; i < variables.length; i++) {
                if (labelNewStringV.localeCompare(variables[i]) == 0)
                {
                  coincd++;
                }
              }
              if (coincd > 0) {
                var stringTemplate = editor.templates['rectangle'];
              } else {
                var stringTemplate = editor.templates['rounded'];
              }
              var stringClone = editor.graph.model.cloneCell(stringTemplate);
              stringClone.setAttribute('label', labelNewStringV);
              // getting text width and resizing the rectangle if needed
              var contGeo = stringClone.getGeometry();
              contGeo.width = Math.round(getTextWidth(labelNewStringV, '11px arial')) + 30;
              editor.graph.model.setGeometry(stringClone, contGeo);

              // searching for far right cell x coordinate
              var elemLine = new Array();
              var containerChildren = editor.graph.model.getChildren(newContainer);
              var farRightX = cellEtarget.x;
              for (i = 0; i < containerChildren.length; i++)
              {
                var cellType = containerChildren[i].getValue();
                if (cellType.tagName == 'Rect' || cellType.tagName == 'Roundrect')
                {
                  var geoCompare = containerChildren[i].getGeometry();
                  if (geoCompare.x >= cellEtarget.x && geoCompare.y == (cellE3source.y-10) && geoCompare.x <= cellE2source.x)
                  {
                      if ((geoCompare.x + geoCompare.width) >= farRightX)
                      {
                        farRightX = geoCompare.x + geoCompare.width;
                        var geoCompareF = geoCompare;
                      }
                      elemLine.push(containerChildren[i]);
                  }
                }
              }

              // adding the cell and moving it
              var stringRectangle = editor.graph.model.add(newContainer, stringClone);
              var stringRectangleGeo = editor.graph.getCellGeometry(stringRectangle).clone();
              stringRectangleGeo.height = 20;
              stringRectangleGeo.y = cellE3source.y-10;
              if (typeof geoCompareF != "undefined") {
                // if there are cells on this Y level add up widths of the elements
                var lengthSum = 40;
                for (i=0; i < elemLine.length; i++)
                {
                  lengthSum += elemLine[i].getGeometry().width + 40;
                }
                lengthSum += stringRectangleGeo.width;
                // compare it to to the width of the line
                if (lengthSum > Math.abs(cellE3target.x - cellE3source.x))
                {
                  // have to extend the line and the parent line, possibly  adjust the other lines as well
                  for (i=0; i<containerChildren.length; i++)
                  {
                    // if rectangle and to the right move further to the right
                    var cellType = containerChildren[i].getValue();
                    if (cellType.tagName == 'Rect' || cellType.tagName == 'Roundrect')
                    {
                      if (containerChildren[i].geometry.x >= cellE3target.x)
                      {
                        var currCellGeo = containerChildren[i].geometry;
                        currCellGeo.x += stringRectangleGeo.width+40;
                        editor.graph.model.setGeometry(containerChildren[i], currCellGeo);
                      }
                    }
                  }
                  for (i=0; i<containerChildren.length; i++)
                  {
                    // if ellipse move to the right
                    var cellStyle = containerChildren[i].getStyle();
                    if (cellStyle == 'ellipse')
                    {
                      if (containerChildren[i].geometry.x > cellE3target.x)
                      {
                        var currCellGeo = containerChildren[i].geometry;
                        currCellGeo.x += stringRectangleGeo.width+40;
                        editor.graph.model.setGeometry(containerChildren[i], currCellGeo);
                      }
                    }
                    // moving the edge(s) to the right
                    var compTargetX = cellE3target.x;
                    var cellType = containerChildren[i].getValue();
                    if (cellType.tagName == 'Connector')
                    {
                      var childEdges = editor.graph.getChildEdges(containerChildren[i]);
                      for (var j = 0; j < childEdges.length; j++)
                      {
                        if (childEdges[j].geometry.sourcePoint.x >= compTargetX)
                        {
                          var cEdgesGeo = childEdges[j].geometry;
                          cEdgesGeo.sourcePoint.x += stringRectangleGeo.width+40;
                          editor.graph.model.setGeometry(childEdges[j], cEdgesGeo);
                          if (editor.graph.getCellOverlays(childEdges[j]) != null)
                          {
                            var cOverlay = editor.graph.getCellOverlays(childEdges[j])[0];
                            cOverlay.image = new mxImage('images/add.png', 28, 28);
                            cOverlay.offset.x = Math.abs((cEdgesGeo.targetPoint.x - cEdgesGeo.sourcePoint.x) / 2);
                          }
                        }
                        if (childEdges[j].geometry.targetPoint.x >= compTargetX) {
                          var cEdgesGeo = childEdges[j].geometry;
                          cEdgesGeo.targetPoint.x += stringRectangleGeo.width+40;
                          editor.graph.model.setGeometry(childEdges[j], cEdgesGeo);
                          if (editor.graph.getCellOverlays(childEdges[j]) != null)
                          {
                            var cOverlay = editor.graph.getCellOverlays(childEdges[j])[0];
                            cOverlay.image = new mxImage('images/add.png', 28, 28);
                            cOverlay.offset.x = Math.abs((cEdgesGeo.targetPoint.x - cEdgesGeo.sourcePoint.x) / 2);
                          }
                        }
                      }
                    }
                  }
                  stringRectangleGeo.x = farRightX + 40;
                } else {
                  // dont have to extend the line, just add to the right
                  stringRectangleGeo.x = farRightX + 40;
                }
              } else {
                // if there are no cells on this Y level check the line length, extend it if needed and then put the cell on the leftmost point
                if (stringRectangleGeo.width+20 > Math.abs(cellE3G.targetPoint.x - cellE3G.sourcePoint.x))
                {
                  var containerChildren = editor.graph.model.getChildren(newContainer);
                  for (i=0; i<containerChildren.length; i++)
                  {
                    // if rectangle and to the right move further to the right
                    var cellType = containerChildren[i].getValue();
                    if (cellType.tagName == 'Rect' || cellType.tagName == 'Roundrect')
                    {
                      if (containerChildren[i].geometry.x >= cellE3target.x)
                      {
                        var currCellGeo = containerChildren[i].geometry;
                        currCellGeo.x += stringRectangleGeo.width+10;
                        editor.graph.model.setGeometry(containerChildren[i], currCellGeo);
                      }
                    }
                  }
                  for (i=0; i<containerChildren.length; i++)
                  {
                    // if ellipse move to the right
                    var cellStyle = containerChildren[i].getStyle();
                    if (cellStyle == 'ellipse')
                    {
                      if (containerChildren[i].geometry.x > cellE3target.x)
                      {
                        var currCellGeo = containerChildren[i].geometry;
                        currCellGeo.x += stringRectangleGeo.width+10;
                        editor.graph.model.setGeometry(containerChildren[i], currCellGeo);
                      }
                    }
                    // moving the edge(s) to the right
                    var compTargetX = cellE3target.x;
                    var cellType = containerChildren[i].getValue();
                    if (cellType.tagName == 'Connector')
                    {
                      var childEdges = editor.graph.getChildEdges(containerChildren[i]);
                      for (var j = 0; j < childEdges.length; j++)
                      {
                        if (childEdges[j].geometry.sourcePoint.x >= compTargetX )
                        {
                          var cEdgesGeo = childEdges[j].geometry;
                          cEdgesGeo.sourcePoint.x += stringRectangleGeo.width+10;
                          editor.graph.model.setGeometry(childEdges[j], cEdgesGeo);
                          if (editor.graph.getCellOverlays(childEdges[j]) != null)
                          {
                            var cOverlay = editor.graph.getCellOverlays(childEdges[j])[0];
                            cOverlay.image = new mxImage('images/add.png', 28, 28);
                            cOverlay.offset.x = Math.abs((cEdgesGeo.targetPoint.x - cEdgesGeo.sourcePoint.x) / 2);
                          }
                        }
                        if (childEdges[j].geometry.targetPoint.x >= compTargetX ) {
                          var cEdgesGeo = childEdges[j].geometry;
                          cEdgesGeo.targetPoint.x += stringRectangleGeo.width+10;
                          editor.graph.model.setGeometry(childEdges[j], cEdgesGeo);
                          if (editor.graph.getCellOverlays(childEdges[j]) != null)
                          {
                            var cOverlay = editor.graph.getCellOverlays(childEdges[j])[0];
                            cOverlay.image = new mxImage('images/add.png', 28, 28);
                            cOverlay.offset.x = Math.abs((cEdgesGeo.targetPoint.x - cEdgesGeo.sourcePoint.x) / 2);
                          }
                        }
                      }
                    }
                  }
                }
                if (cellE3G.targetPoint.x > cellE3G.sourcePoint.x)
                {
                  stringRectangleGeo.x = cellE3G.sourcePoint.x + 10;
                } else {
                  stringRectangleGeo.x = cellE3G.targetPoint.x + 10;
                }
              }
              editor.graph.model.setGeometry(stringRectangle, stringRectangleGeo);

              // resizing container to the right (using the far right coordinate + offset) and moving the right ellipse  + overlay
              var farRightX1 = 0
              var containerChildren = editor.graph.model.getChildren(newContainer);
              for (i = 0; i < containerChildren.length; i++)
              {
                var geoCompare1 = containerChildren[i].getGeometry();
                if (geoCompare1.x > farRightX1)
                {
                  farRightX1 = geoCompare1.x + geoCompare1.width;
                }
              }
              var containerGeo = newContainer.getGeometry();
              containerGeo.width = farRightX1;
              editor.graph.model.setGeometry(newContainer, containerGeo);

              // moving the add level overlay to container/2
              for (i = 0; i < containerChildren.length; i++)
              {
                var cellStyle = containerChildren[i].getStyle();
                if (cellStyle == 'image;image=images/add.png;editable=0;movable=0;selectable=0;resizable=0')
                {
                  var vertGeo = containerChildren[i].getGeometry();
                  vertGeo.x = vertGeo.x = Math.round(containerGeo.width / 2) - vertGeo.width/2;
                  editor.graph.model.setGeometry(containerChildren[i], vertGeo);
                  break;
                }
              }
              editor.graph.refresh();
            }
          });


        }
      }


      ///////////////
      //////////////
      // vert overlay click handler
      //////////////
      //////////////

      var clickedOn = new Array();
      var wnd = null;
      // add vertical elements cell overlay event
      editor.graph.addMouseListener(
      {
       currentState: null,
       mouseDown: function vertClick(sender, me)
       {
         if (this.currentState != null)
         {
           this.dragLeave(me.getEvent(), this.currentState)
         }
         if (editor.graph.model.isVertex(me.getCell()))
         {
            var cellPointer = me.getCell();
            var cellPointerGeo = editor.graph.getCellGeometry(cellPointer).clone();
            var containerGeo = editor.graph.getCellGeometry(newContainer).clone();

            // if the cell clicked on is the vertical add overlay
            if (cellPointer.style == 'image;image=images/add.png;editable=0;movable=0;selectable=0;resizable=0' && cellPointer.parent == newContainer)
            {
              // click on the add vertical elements overlay, draw red dot points between cells
              var cells = editor.graph.getChildCells(newContainer);
              var cellz = []
              var dots = []

              // go through cells and add red dot cells to the left of each cell (only if there isnt a flat edge above the cell)
              for (var i=0; i < cells.length; i++)
              {
                if (cells[i].value.tagName == 'Rect' || cells[i].value.tagName == 'Roundrect')
                {
                  var flag = false;
                  var flag2 = false;
                  var checkX = cells[i].geometry.x;
                  var containerChildren = editor.graph.model.getChildren(newContainer);
                  for (z = 0; z < containerChildren.length; z++)
                  {
                    var cellType = containerChildren[z].getValue();
                    if (cellType.tagName == 'Connector')
                    {
                        var childEdges = editor.graph.getChildEdges(containerChildren[z]);
                        if (childEdges != undefined)
                        {
                          for (var j = 0; j < childEdges.length; j++)
                          {
                            if (checkX+cells[i].geometry.width < Math.max(childEdges[j].geometry.targetPoint.x, childEdges[j].geometry.sourcePoint.x) && checkX+cells[i].geometry.width > Math.min(childEdges[j].geometry.targetPoint.x, childEdges[j].geometry.sourcePoint.x) && childEdges[j].geometry.targetPoint.y == childEdges[j].geometry.sourcePoint.y && cells[i].geometry.y < childEdges[j].geometry.sourcePoint.y-10)
                            {
                              flag2 = true;
                            }
                            if (checkX < Math.max(childEdges[j].geometry.targetPoint.x, childEdges[j].geometry.sourcePoint.x) && checkX > Math.min(childEdges[j].geometry.targetPoint.x, childEdges[j].geometry.sourcePoint.x) && childEdges[j].geometry.targetPoint.y == childEdges[j].geometry.sourcePoint.y && cells[i].geometry.y < childEdges[j].geometry.sourcePoint.y-10)
                            {
                              flag = true;
                              break;
                            }
                          }
                        }
                    }
                  }
                  // if the cell is lower than the base connector
                  var counter = 0;
                  if (cells[i].geometry.y > containerChildren[1].geometry.y-6 && flag == false)
                  {
                    // find out the edge the cell is on
                    var childEdges = editor.graph.getChildEdges(containerChildren[2]);
                    if (childEdges != undefined)
                    {
                      for (var j = 0; j < childEdges.length; j++)
                      {
                        var leftX = Math.min(childEdges[j].geometry.targetPoint.x, childEdges[j].geometry.sourcePoint.x);
                        var rightX = Math.max(childEdges[j].geometry.targetPoint.x, childEdges[j].geometry.sourcePoint.x);
                        // found the edge cell is on
                        if (childEdges[j].geometry.targetPoint.y == childEdges[j].geometry.sourcePoint.y && childEdges[j].geometry.sourcePoint.y - 10 == cells[i].geometry.y && cells[i].geometry.x > leftX && cells[i].geometry.x+cells[i].geometry.width < rightX)
                        {
                          // find other cells on this edge
                          for (var zj = 0; zj < cells.length; zj++)
                          {
                            if (childEdges[j].geometry.sourcePoint.y - 10 == cells[zj].geometry.y && cells[zj].geometry.x > leftX && cells[zj].geometry.x+cells[zj].geometry.width < rightX && cells[i].geometry.x<cells[zj].geometry.x)
                            {
                              counter++;
                              break;
                            }
                          }
                          break;
                        }
                      }
                    }
                  }
                  if (counter == 0 && !flag2 && cells[i].geometry.y > containerChildren[1].geometry.y-6)
                  {
                    var vertO = editor.graph.insertVertex(newContainer, null, '', (cells[i].geometry.x+cells[i].geometry.width+10), cells[i].geometry.y, 20, 20, 'image;image=images/symbols/event_end.png;editable=0;movable=0;selectable=0;resizable=0');
                    dots.unshift(vertO);
                  }
                  if (!flag)
                  {
                    var vertO = editor.graph.insertVertex(newContainer, null, '', (cells[i].geometry.x-30), cells[i].geometry.y, 20, 20, 'image;image=images/symbols/event_end.png;editable=0;movable=0;selectable=0;resizable=0');
                    dots.unshift(vertO);
                    flag = false;
                  }
                }
              }

              // // go through cells again and add red dot cells to the right of rightmost cells
              // for (var i=0; i < cellz.length; i++)
              // {
              // 	if (isRightmost(cellz, i) && cellz[i].geometry.y != secondEllipse.geometry.y-6)
              // 	{
              // 		var vertO = editor.graph.insertVertex(newContainer, null, '', (cellz[i].geometry.x+cellz[i].geometry.width+10), cellz[i].geometry.y, 20, 20, 'image;image=images/symbols/event_end.png;editable=0;movable=0;selectable=0;resizable=0');
              // 		dots.unshift(vertO);
              // 	}
              // }

              // add dot to the left of right ellipse
              var vertO = editor.graph.insertVertex(newContainer, null, '', secondEllipse.geometry.x-20, secondEllipse.geometry.y-6, 20, 20, 'image;image=images/symbols/event_end.png;editable=0;movable=0;selectable=0;resizable=0');
              dots.unshift(vertO);

              // add dot to the right of left ellipse
              var vertO = editor.graph.insertVertex(newContainer, null, '', (firstEllipse.geometry.x+firstEllipse.geometry.width+10), firstEllipse.geometry.y-6, 20, 20, 'image;image=images/symbols/event_end.png;editable=0;movable=0;selectable=0;resizable=0');
              dots.unshift(vertO);


              var html = `<table height=100%> <tr> <td> <span id='vertTip'> Select the first (start) point </span> </td></tr><tr><td> <button style="float:bottom" id='closeBtn' style='align:right'>Cancel</button> </td></tr></table> `
              var tb = document.createElement('div');
              tb.innerHTML = html;
              wnd = new mxWindow('Tip', tb, me.getX(), me.getY(), 250, undefined, false, true);
              wnd.setLocation = function(x, y)
               {
                 x = me.getX();
                 y = me.getY();
                 mxWindow.prototype.setLocation.apply(this, arguments);
              };

              // on "cancel" press go through the cells and delete the dots
              document.getElementById('closeBtn').onclick = function()
              {
                for (var i=0; i < dots.length; i++)
                {
                  editor.graph.model.remove(dots[i]);
                }
                wnd.destroy();
                overlayInput.checked = true;
                toggleOverlay(editor);
                clickedOn.length = 0;
              };
              overlayInput.checked = false;
              toggleOverlay(editor);
              wnd.setVisible(true);
            }

            // if the cell clicked on is the dot
            if (cellPointer.style == 'image;image=images/symbols/event_end.png;editable=0;movable=0;selectable=0;resizable=0' && cellPointer.parent == newContainer)
            {

              // add the cell coordinates to the clickedOn array
              if (clickedOn.length < 4)
              {
                clickedOn.push(cellPointerGeo.x+cellPointerGeo.width/2);
                clickedOn.push(cellPointerGeo.y+10);
              }

              // go through the cells and remove the dot cells that are not on the same Y level if the start point is chosen
              var cells = editor.graph.getChildCells(newContainer);
              if (clickedOn.length == 2)
              {
                for (var i=0; i < cells.length; i++)
                {
                  if (cells[i].style == 'image;image=images/symbols/event_end.png;editable=0;movable=0;selectable=0;resizable=0' && cellPointerGeo.y != cells[i].geometry.y)
                  {
                    editor.graph.model.remove(cells[i]);
                  }
                }
                document.getElementById('vertTip').innerHTML = 'Select the second (end) point'
              }

              // if the end point is chosen remove all dots and add the lines
              if (clickedOn.length == 4)
              {
                for (var i=0; i < cells.length; i++)
                {
                  if (cells[i].style == 'image;image=images/symbols/event_end.png;editable=0;movable=0;selectable=0;resizable=0')
                  {
                    editor.graph.model.remove(cells[i]);
                  }
                }
                var bottomY = firstEllipse.geometry.y + firstEllipse.geometry.height/2 + 30;

                // find the lowest Y in the specified X range
                var containerChildren = editor.graph.model.getChildren(newContainer);
                for (i = 0; i < containerChildren.length; i++)
                {
                  var cellType = containerChildren[i].getValue();
                  if (cellType.tagName == 'Connector')
                  {
                      var childEdges = editor.graph.getChildEdges(containerChildren[i]);
                      if (childEdges != undefined)
                      {
                        for (var j = 0; j < childEdges.length; j++)
                        {
                          if (childEdges[j].geometry.sourcePoint.y == childEdges[j].geometry.targetPoint.y && childEdges[j].geometry.targetPoint.y >= bottomY)
                          {
                              if (childEdges[j].geometry.sourcePoint.x >= clickedOn[0] && childEdges[j].geometry.targetPoint.x <= clickedOn[2])
                              {
                                bottomY = childEdges[j].geometry.targetPoint.y;
                              } else if (childEdges[j].geometry.targetPoint.x >= clickedOn[0] && childEdges[j].geometry.sourcePoint.x <= clickedOn[2]) {
                                bottomY = childEdges[j].geometry.targetPoint.y;
                              }
                          }
                        }
                      }
                  }
                }
                var setY = bottomY + 30;

                // determine special conditions (specialCase == 1 if the target and source are the same point, == 2 if source > target)
                var specialCase = 0;
                if (clickedOn[0] == clickedOn[2] && clickedOn[1] == clickedOn[3])
                {
                  specialCase = 1;
                }
                if (clickedOn[0] > clickedOn[2])
                {
                  specialCase = 2;
                  var tmp = clickedOn[0];
                  clickedOn[0] = clickedOn[2];
                  clickedOn[2] = tmp;
                }

                // left line
                var cellE = new mxCell('edge', new mxGeometry(0, 0, 50, 50), 'curved=0;endArrow=classic;html=1;');
                if (specialCase == 0)
                {
                  cellE.geometry.setTerminalPoint(new mxPoint(clickedOn[0], clickedOn[1]), true);
                  cellE.geometry.setTerminalPoint(new mxPoint(clickedOn[0]+30, setY), false);
                } else if (specialCase == 1) {
                  cellE.geometry.setTerminalPoint(new mxPoint(clickedOn[0], clickedOn[1]), true);
                  cellE.geometry.setTerminalPoint(new mxPoint(clickedOn[0]+30, setY), false);
                } else if (specialCase == 2) {
                  cellE.geometry.setTerminalPoint(new mxPoint(clickedOn[0], clickedOn[1]), false);
                  cellE.geometry.setTerminalPoint(new mxPoint(clickedOn[0]+30, setY), true);
                  cellE.setStyle('curved=0;endArrow=none;html=1;')
                }
                cellE.edge = true;
                cellE = editor.graph.addCell(cellE, ellipseEdge);
                editor.graph.fireEvent(new mxEventObject('cellsInserted', 'cells', [cellE]));

                // right line
                var cellE2 = new mxCell('edge', new mxGeometry(0, 0, 50, 50), 'curved=0;endArrow=classic;html=1;');
                if (specialCase == 0)
                {
                  cellE2.geometry.setTerminalPoint(new mxPoint(clickedOn[2]-30, setY), true);
                  cellE2.geometry.setTerminalPoint(new mxPoint(clickedOn[2], clickedOn[3]), false);
                } else if (specialCase == 1) {
                  cellE2.geometry.setTerminalPoint(new mxPoint(clickedOn[2]-30, setY), false);
                  cellE2.geometry.setTerminalPoint(new mxPoint(clickedOn[2], clickedOn[3]), true);
                } else if (specialCase == 2) {
                  cellE2.geometry.setTerminalPoint(new mxPoint(clickedOn[2]-30, setY), false);
                  cellE2.geometry.setTerminalPoint(new mxPoint(clickedOn[2], clickedOn[3]), true);
                }
                cellE2.edge = true;
                cellE2 = editor.graph.addCell(cellE2, ellipseEdge);
                editor.graph.fireEvent(new mxEventObject('cellsInserted', 'cells', [cellE2]));

                // middle flat line
                var cellE3 = new mxCell('edge', new mxGeometry(0, 0, 50, 50), 'curved=0;endArrow=classic;html=1;');
                if (specialCase == 0)
                {
                  cellE3.geometry.setTerminalPoint(new mxPoint(clickedOn[0]+30, setY), true);
                  cellE3.geometry.setTerminalPoint(new mxPoint(clickedOn[2]-30, setY), false);
                } else if (specialCase == 1) {
                  cellE3.geometry.setTerminalPoint(new mxPoint(clickedOn[0]+30, setY), true);
                  cellE3.geometry.setTerminalPoint(new mxPoint(clickedOn[2]-30, setY), false);
                } else if (specialCase == 2) {
                  cellE3.geometry.setTerminalPoint(new mxPoint(clickedOn[0]+30, setY), false);
                  cellE3.geometry.setTerminalPoint(new mxPoint(clickedOn[2]-30, setY), true);
                }
                cellE3.edge = true;
                cellE3 = editor.graph.addCell(cellE3, ellipseEdge);
                editor.graph.fireEvent(new mxEventObject('cellsInserted', 'cells', [cellE3]));


                // move the overlay itself
                var vertGeo = vert.geometry;
                vertGeo.y = bottomY + 50;
                editor.graph.model.setGeometry(vert, vertGeo);

                // resizing the container
                var containerGeo = editor.graph.getCellGeometry(newContainer).clone();
                containerGeo.height = vertGeo.y + vertGeo.height;
                editor.graph.model.setGeometry(newContainer, containerGeo);
                // variables to use later to determine where to place new cells
                var cellE3G = cellE3.geometry;
                var cellEG = cellE.geometry;
                var cellE2G = cellE2.geometry;

                // set up variables for later use
                if (specialCase == 0)
                {
                  var cellEsource = {
                    x : cellE.geometry.sourcePoint.x,
                    y : cellE.geometry.sourcePoint.y
                  };
                  var cellEtarget = {
                    x : cellE.geometry.targetPoint.x,
                    y : cellE.geometry.targetPoint.y
                  };
                  var cellE2source = {
                    x : cellE2.geometry.sourcePoint.x,
                    y : cellE2.geometry.sourcePoint.y
                  };
                  var cellE2target = {
                    x : cellE2.geometry.targetPoint.x,
                    y : cellE2.geometry.targetPoint.y
                  };
                  var cellE3source = {
                    x : cellE3G.sourcePoint.x,
                    y : cellE3G.sourcePoint.y
                  };
                  var cellE3target = {
                    x : cellE3G.targetPoint.x,
                    y : cellE3G.targetPoint.y
                  };
                } else if (specialCase == 1) {
                  var cellEsource = {
                    x : cellE.geometry.sourcePoint.x,
                    y : cellE.geometry.sourcePoint.y
                  };
                  var cellEtarget = {
                    x : cellE.geometry.targetPoint.x,
                    y : cellE.geometry.targetPoint.y
                  };
                  var cellE2source = {
                    x : cellE2.geometry.sourcePoint.x,
                    y : cellE2.geometry.sourcePoint.y
                  };
                  var cellE2target = {
                    x : cellE2.geometry.targetPoint.x,
                    y : cellE2.geometry.targetPoint.y
                  };
                  var cellE3source = {
                    x : cellE3.geometry.sourcePoint.x,
                    y : cellE3.geometry.sourcePoint.y
                  };
                  var cellE3target = {
                    x : cellE3.geometry.targetPoint.x,
                    y : cellE3.geometry.targetPoint.y
                  };
                } else if (specialCase == 2) {
                  var cellEsource = {
                    x : cellE.geometry.targetPoint.x,
                    y : cellE.geometry.targetPoint.y
                  };
                  var cellEtarget = {
                    x : cellE.geometry.sourcePoint.x,
                    y : cellE.geometry.sourcePoint.y
                  };
                  var cellE2source = {
                    x : cellE2.geometry.targetPoint.x,
                    y : cellE2.geometry.targetPoint.y
                  };
                  var cellE2target = {
                    x : cellE2.geometry.sourcePoint.x,
                    y : cellE2.geometry.sourcePoint.y
                  };
                  var cellE3source = {
                    x : cellE3.geometry.targetPoint.x,
                    y : cellE3.geometry.targetPoint.y
                  };
                  var cellE3target = {
                    x : cellE3.geometry.sourcePoint.x,
                    y : cellE3.geometry.sourcePoint.y
                  };
                }

                // adding overlay to add elements to the line
                if (overlayInput.checked) {
                  var overlayV = new mxCellOverlay(new mxImage('images/add.png', 28, 28), 'Add New Element');
                } else {
                  var overlayV = new mxCellOverlay(new mxImage('images/add.png', 0, 0), 'Add New Element');
                }
                overlayV.cursor = 'hand';
                // overlayV.offset.x = (clickedOn[2]-clickedOn[0] - 60)/2
                if (specialCase == 0)
                {
                  overlayV.offset.x = (cellE2target.x-cellEtarget.x - 60)/2;
                } else if (specialCase == 2) {
                  overlayV.offset.x = (cellE2target.x-cellEtarget.x - 60)/2;
                }

                editor.graph.addCellOverlay(cellE3, overlayV);

                // overlay click action
                overlayV.addListener(mxEvent.CLICK, function horClick1(sender, evt2)
                {
                  if (specialCase == 0)
                  {
                    var cellEsource = {
                      x : cellE.geometry.sourcePoint.x,
                      y : cellE.geometry.sourcePoint.y
                    };
                    var cellEtarget = {
                      x : cellE.geometry.targetPoint.x,
                      y : cellE.geometry.targetPoint.y
                    };
                    var cellE2source = {
                      x : cellE2.geometry.sourcePoint.x,
                      y : cellE2.geometry.sourcePoint.y
                    };
                    var cellE2target = {
                      x : cellE2.geometry.targetPoint.x,
                      y : cellE2.geometry.targetPoint.y
                    };
                    var cellE3source = {
                      x : cellE3.geometry.sourcePoint.x,
                      y : cellE3.geometry.sourcePoint.y
                    };
                    var cellE3target = {
                      x : cellE3.geometry.targetPoint.x,
                      y : cellE3.geometry.targetPoint.y
                    };
                  } else if (specialCase == 2) {
                    var cellEsource = {
                      x : cellE.geometry.targetPoint.x,
                      y : cellE.geometry.targetPoint.y
                    };
                    var cellEtarget = {
                      x : cellE.geometry.sourcePoint.x,
                      y : cellE.geometry.sourcePoint.y
                    };
                    var cellE2source = {
                      x : cellE2.geometry.targetPoint.x,
                      y : cellE2.geometry.targetPoint.y
                    };
                    var cellE2target = {
                      x : cellE2.geometry.sourcePoint.x,
                      y : cellE2.geometry.sourcePoint.y
                    };
                    var cellE3source = {
                      x : cellE3.geometry.targetPoint.x,
                      y : cellE3.geometry.targetPoint.y
                    };
                    var cellE3target = {
                      x : cellE3.geometry.sourcePoint.x,
                      y : cellE3.geometry.sourcePoint.y
                    };
                  }
                  editor.graph.clearSelection();
                  var labelNewStringV = prompt("New Element Name", "Enter here");
                  var coincd = 0;
                  variables = nonTerminalsList();
                  if (labelNewStringV != null) {
                    for (i = 0; i < variables.length; i++) {
                      if (labelNewStringV.localeCompare(variables[i]) == 0)
                      {
                        coincd++;
                      }
                    }
                    if (coincd > 0) {
                      var stringTemplate = editor.templates['rectangle'];
                    } else {
                      var stringTemplate = editor.templates['rounded'];
                    }
                    var stringClone = editor.graph.model.cloneCell(stringTemplate);
                    stringClone.setAttribute('label', labelNewStringV);
                    // getting text width and resizing the rectangle if needed
                    var contGeo = stringClone.getGeometry();
                    contGeo.width = Math.round(getTextWidth(labelNewStringV, '11px arial')) + 30;
                    editor.graph.model.setGeometry(stringClone, contGeo);

                    // searching for far right cell x coordinate
                    var elemLine = new Array();
                    var containerChildren = editor.graph.model.getChildren(newContainer);
                    var farRightX = cellEtarget.x;
                    for (i = 0; i < containerChildren.length; i++)
                    {
                      var cellType = containerChildren[i].getValue();
                      if (cellType.tagName == 'Rect' || cellType.tagName == 'Roundrect')
                      {
                        var geoCompare = containerChildren[i].getGeometry();
                        if (geoCompare.x >= cellEtarget.x && geoCompare.y == (cellE3source.y-10) && geoCompare.x <= cellE2source.x)
                        {
                            if ((geoCompare.x + geoCompare.width) >= farRightX)
                            {
                              farRightX = geoCompare.x + geoCompare.width;
                              var geoCompareF = geoCompare;
                            }
                            elemLine.push(containerChildren[i]);
                        }
                      }
                    }

                    // adding the cell and moving it
                    var stringRectangle = editor.graph.model.add(newContainer, stringClone);
                    var stringRectangleGeo = editor.graph.getCellGeometry(stringRectangle).clone();
                    stringRectangleGeo.height = 20;
                    stringRectangleGeo.y = cellE3source.y-10;
                    if (typeof geoCompareF != "undefined") {
                      // if there are cells on this Y level add up widths of the elements
                      var lengthSum = 40;
                      for (i=0; i < elemLine.length; i++)
                      {
                        lengthSum += elemLine[i].getGeometry().width + 40;
                      }
                      lengthSum += stringRectangleGeo.width;
                      // compare it to to the width of the line
                      if (lengthSum > Math.abs(cellE3target.x - cellE3source.x))
                      {
                        // have to extend the line and the parent line, possibly  adjust the other lines as well
                        for (i=0; i<containerChildren.length; i++)
                        {
                          // if rectangle and to the right move further to the right
                          var cellType = containerChildren[i].getValue();
                          if (cellType.tagName == 'Rect' || cellType.tagName == 'Roundrect')
                          {
                            if (containerChildren[i].geometry.x >= cellE3target.x)
                            {
                              var currCellGeo = containerChildren[i].geometry;
                              currCellGeo.x += stringRectangleGeo.width+40;
                              editor.graph.model.setGeometry(containerChildren[i], currCellGeo);
                            }
                          }
                        }
                        for (i=0; i<containerChildren.length; i++)
                        {
                          // if ellipse move to the right
                          var cellStyle = containerChildren[i].getStyle();
                          if (cellStyle == 'ellipse')
                          {
                            if (containerChildren[i].geometry.x > cellE3target.x)
                            {
                              var currCellGeo = containerChildren[i].geometry;
                              currCellGeo.x += stringRectangleGeo.width+40;
                              editor.graph.model.setGeometry(containerChildren[i], currCellGeo);
                            }
                          }
                          // moving the edge(s) to the right
                          var compTargetX = cellE3target.x;
                          var cellType = containerChildren[i].getValue();
                          if (cellType.tagName == 'Connector')
                          {
                            var childEdges = editor.graph.getChildEdges(containerChildren[i]);
                            for (var j = 0; j < childEdges.length; j++)
                            {
                              if (childEdges[j].geometry.sourcePoint.x >= compTargetX)
                              {
                                var cEdgesGeo = childEdges[j].geometry;
                                cEdgesGeo.sourcePoint.x += stringRectangleGeo.width+40;
                                editor.graph.model.setGeometry(childEdges[j], cEdgesGeo);
                                if (editor.graph.getCellOverlays(childEdges[j]) != null)
                                {
                                  var cOverlay = editor.graph.getCellOverlays(childEdges[j])[0];
                                  cOverlay.image = new mxImage('images/add.png', 28, 28);
                                  cOverlay.offset.x = Math.abs((cEdgesGeo.targetPoint.x - cEdgesGeo.sourcePoint.x) / 2);
                                }
                              }
                              if (childEdges[j].geometry.targetPoint.x >= compTargetX) {
                                var cEdgesGeo = childEdges[j].geometry;
                                cEdgesGeo.targetPoint.x += stringRectangleGeo.width+40;
                                editor.graph.model.setGeometry(childEdges[j], cEdgesGeo);
                                if (editor.graph.getCellOverlays(childEdges[j]) != null)
                                {
                                  var cOverlay = editor.graph.getCellOverlays(childEdges[j])[0];
                                  cOverlay.image = new mxImage('images/add.png', 28, 28);
                                  cOverlay.offset.x = Math.abs((cEdgesGeo.targetPoint.x - cEdgesGeo.sourcePoint.x) / 2);
                                }
                              }
                            }
                          }
                        }
                        stringRectangleGeo.x = farRightX + 40;
                      } else {
                        // dont have to extend the line, just add to the right
                        stringRectangleGeo.x = farRightX + 40;
                      }
                    } else {
                      // if there are no cells on this Y level check the line length, extend it if needed and then put the cell on the leftmost point
                      if (stringRectangleGeo.width+20 > Math.abs(cellE3G.targetPoint.x - cellE3G.sourcePoint.x))
                      {
                        var containerChildren = editor.graph.model.getChildren(newContainer);
                        for (i=0; i<containerChildren.length; i++)
                        {
                          // if rectangle and to the right move further to the right
                          var cellType = containerChildren[i].getValue();
                          if (cellType.tagName == 'Rect' || cellType.tagName == 'Roundrect')
                          {
                            if (containerChildren[i].geometry.x >= cellE3target.x)
                            {
                              var currCellGeo = containerChildren[i].geometry;
                              currCellGeo.x += stringRectangleGeo.width+10;
                              editor.graph.model.setGeometry(containerChildren[i], currCellGeo);
                            }
                          }
                        }
                        for (i=0; i<containerChildren.length; i++)
                        {
                          // if ellipse move to the right
                          var cellStyle = containerChildren[i].getStyle();
                          if (cellStyle == 'ellipse')
                          {
                            if (containerChildren[i].geometry.x > cellE3target.x)
                            {
                              var currCellGeo = containerChildren[i].geometry;
                              currCellGeo.x += stringRectangleGeo.width+10;
                              editor.graph.model.setGeometry(containerChildren[i], currCellGeo);
                            }
                          }
                          // moving the edge(s) to the right
                          var compTargetX = cellE3target.x;
                          var cellType = containerChildren[i].getValue();
                          if (cellType.tagName == 'Connector')
                          {
                            var childEdges = editor.graph.getChildEdges(containerChildren[i]);
                            for (var j = 0; j < childEdges.length; j++)
                            {
                              if (childEdges[j].geometry.sourcePoint.x >= compTargetX )
                              {
                                var cEdgesGeo = childEdges[j].geometry;
                                cEdgesGeo.sourcePoint.x += stringRectangleGeo.width+10;
                                editor.graph.model.setGeometry(childEdges[j], cEdgesGeo);
                                if (editor.graph.getCellOverlays(childEdges[j]) != null)
                                {
                                  var cOverlay = editor.graph.getCellOverlays(childEdges[j])[0];
                                  cOverlay.image = new mxImage('images/add.png', 28, 28);
                                  cOverlay.offset.x = Math.abs((cEdgesGeo.targetPoint.x - cEdgesGeo.sourcePoint.x) / 2);
                                }
                              }
                              if (childEdges[j].geometry.targetPoint.x >= compTargetX ) {
                                var cEdgesGeo = childEdges[j].geometry;
                                cEdgesGeo.targetPoint.x += stringRectangleGeo.width+10;
                                editor.graph.model.setGeometry(childEdges[j], cEdgesGeo);
                                if (editor.graph.getCellOverlays(childEdges[j]) != null)
                                {
                                  var cOverlay = editor.graph.getCellOverlays(childEdges[j])[0];
                                  cOverlay.image = new mxImage('images/add.png', 28, 28);
                                  cOverlay.offset.x = Math.abs((cEdgesGeo.targetPoint.x - cEdgesGeo.sourcePoint.x) / 2);
                                }
                              }
                            }
                          }
                        }
                      }
                      if (cellE3G.targetPoint.x > cellE3G.sourcePoint.x)
                      {
                        stringRectangleGeo.x = cellE3G.sourcePoint.x + 10;
                      } else {
                        stringRectangleGeo.x = cellE3G.targetPoint.x + 10;
                      }
                    }
                    editor.graph.model.setGeometry(stringRectangle, stringRectangleGeo);

                    // resizing container to the right (using the far right coordinate + offset) and moving the right ellipse  + overlay
                    var farRightX1 = 0
                    var containerChildren = editor.graph.model.getChildren(newContainer);
                    for (i = 0; i < containerChildren.length; i++)
                    {
                      var geoCompare1 = containerChildren[i].getGeometry();
                      if (geoCompare1.x > farRightX1)
                      {
                        farRightX1 = geoCompare1.x + geoCompare1.width;
                      }
                    }
                    var containerGeo = newContainer.getGeometry();
                    containerGeo.width = farRightX1;
                    editor.graph.model.setGeometry(newContainer, containerGeo);

                    // moving the add level overlay to container/2
                    for (i = 0; i < containerChildren.length; i++)
                    {
                      var cellStyle = containerChildren[i].getStyle();
                      if (cellStyle == 'image;image=images/add.png;editable=0;movable=0;selectable=0;resizable=0')
                      {
                        var vertGeo = containerChildren[i].getGeometry();
                        vertGeo.x = vertGeo.x = Math.round(containerGeo.width / 2) - vertGeo.width/2;
                        editor.graph.model.setGeometry(containerChildren[i], vertGeo);
                        break;
                      }
                    }
                    editor.graph.refresh();
                  }
                });
                clickedOn.length = 0;
                wnd.destroy();
                overlayInput.checked = true;
                toggleOverlay(editor);
                realignNonTerminals();
              }
            }
         }
       },
       mouseMove: function(sender, me)
       {},
       mouseUp: function(sender, me)
       {},
       dragEnter: function(evt, state)
       {},
       dragLeave: function(evt, state)
       {}
      });

    }
  }

  // check if the cell is the rightmost on its height level
  function isRightmost(list, index)
  {
    var right = new Array();
    for (var i=0; i < list.length; i++)
    {
      if (list[i].geometry.x > list[index].geometry.x && list[i].geometry.y == list[index].geometry.y)
      {
        right.push(list[i]);
      }
    }
    if (right.length == 0)
    {
      return true
    } else {
      return false
    }
  }

  // check if the cell is the leftmost on its height level
  function isLeftmost(list, index)
  {
    var left = new Array();
    for (var i=0; i < list.length; i++)
    {
      if (list[i].geometry.x < list[index].geometry.x && list[i].geometry.y == list[index].geometry.y)
      {
        left.push(list[i]);
      }
    }
    if (left.length == 0)
    {
      return true
    } else {
      return false
    }
  }

  // realigns non-terminals vertically
  function realignNonTerminals()
  {
    var parent = editor.graph.getDefaultParent();
    var containerList = editor.graph.getChildCells(parent);
    if (containerList.length > 0) {
      // going through containers
      for (var i = 0; i < containerList.length-1; i++)
      {
        var cG = containerList[i].geometry;
        var cGNext = containerList[i+1].geometry;
        if (cG.y+cG.height > cGNext.y)
        {
          cGNext.y = cG.y+cG.height;
          editor.graph.model.setGeometry(containerList[i+1], cGNext);
        }
      }
      editor.graph.refresh();
    }
  }

  // returns all of the containers labels
  function nonTerminalsList()
  {
    var labels = new Array();
    var parent = editor.graph.getDefaultParent();
    var containerList = editor.graph.model.getChildCells(parent);
    if (containerList.length > 0)
    {
      var containerList = editor.graph.getChildCells(parent);
      for (var i = 0; i < containerList.length; i++)
      {
        labels.push(containerList[i].getAttribute('label').slice(0,-1));
      }
    }
    return labels;
  }

  // measuring the text width
  function getTextWidth(text, font)
  {
    var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    var context = canvas.getContext("2d");
    context.font = font;
    var metrics = context.measureText(text);
    return metrics.width;
  }

  // get cell by style from the list
  function getCellbyStyle(list, style)
  {
    var cell = null;
    for (var i=0; i < list.length; i++)
    {
      if (list[i].getStyle() == style)
      {
        cell = list[i];
        break;
      }
    }
    return cell;
  }
}
