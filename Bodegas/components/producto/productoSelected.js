'use strict';

app.productoSelected = kendo.observable({
    onShow: function () {},
    afterShow: function () {},
    ordernarProductos: function (e) {
        // console.log(e);
        // console.log(e.currentTarget.innerText);
        // console.log(e.currentTarget.firstChild);
        // console.log(e.currentTarget.firstChild.className);
        var tipo = e.currentTarget.innerText;
        var orden = "desc";
        var arrow = e.currentTarget.firstChild.className;
        switch (tipo) {
            case "Nombre":
                if (arrow == "km-icon km-action") {
                    orden = "desc";
                    e.currentTarget.firstChild.className = "km-icon km-reply";
                    app.productoSelected.productoSelectedModel.ordenar("nombre", orden);
                } else {
                    orden = "asc";
                    e.currentTarget.firstChild.className = "km-icon km-action";
                    app.productoSelected.productoSelectedModel.ordenar("nombre", orden);
                }
                break;
            case "Precio":
                if (arrow == "km-icon km-action") {
                    orden = "desc";
                    e.currentTarget.firstChild.className = "km-icon km-reply";
                    app.productoSelected.productoSelectedModel.ordenar("precio", orden);
                } else {
                    orden = "asc";
                    e.currentTarget.firstChild.className = "km-icon km-action";
                    app.productoSelected.productoSelectedModel.ordenar("precio", orden);
                }
                break;
            case "Envio":
                if (arrow == "km-icon km-action") {
                    orden = "desc";
                    e.currentTarget.firstChild.className = "km-icon km-reply";
                    app.productoSelected.productoSelectedModel.ordenar("costo_envio", orden);
                } else {
                    orden = "asc";
                    e.currentTarget.firstChild.className = "km-icon km-action";
                    app.productoSelected.productoSelectedModel.ordenar("costo_envio", orden);
                }
                break;
            default:
                break;
        }
    }
});

// START_CUSTOM_CODE_producto
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_producto
(function (parent) {
    var dataProvider = app.data.bodegas,
        fetchFilteredData = function (paramFilter, searchFilter) {
            var model = parent.get('productoSelectedModel'),
                dataSource = model.get('dataSource');

            if (paramFilter) {
                model.set('paramFilter', paramFilter);
            } else {
                model.set('paramFilter', undefined);
            }

            if (paramFilter && searchFilter) {
                dataSource.filter({
                    logic: 'and',
                    filters: [paramFilter, searchFilter]
                });
            } else if (paramFilter || searchFilter) {
                dataSource.filter(paramFilter || searchFilter);
            } else {
                dataSource.filter({});
            }
        },
        processImage = function (img) {

            function isAbsolute(img) {
                if  (img && (img.slice(0,  5)  ===  'http:' || img.slice(0,  6)  ===  'https:' || img.slice(0,  2)  ===  '//'  ||  img.slice(0,  5)  ===  'data:')) {
                    return true;
                }
                return false;
            }

            if (!img) {
                var empty1x1png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQI12NgYAAAAAMAASDVlMcAAAAASUVORK5CYII=';
                img = 'data:image/png;base64,' + empty1x1png;
            } else if (!isAbsolute(img)) {
                var setup = dataProvider.setup || {};
                img = setup.scheme + ':' + setup.url + setup.appId + '/Files/' + img + '/Download';
            }

            return img;
        },
        flattenLocationProperties = function (dataItem) {
            var propName, propValue,
                isLocation = function (value) {
                    return propValue && typeof propValue === 'object' &&
                        propValue.longitude && propValue.latitude;
                };

            for (propName in dataItem) {
                if (dataItem.hasOwnProperty(propName)) {
                    propValue = dataItem[propName];
                    if (isLocation(propValue)) {
                        dataItem[propName] =
                            kendo.format('Latitude: {0}, Longitude: {1}',
                                propValue.latitude, propValue.longitude);
                    }
                }
            }
        },
        dataSourceOptions = {
            type: 'everlive',
            transport: {
                typeName: 'producto',
                dataProvider: dataProvider
            },
            change: function (e) {
                var data = this.data();
                for (var i = 0; i < data.length; i++) {
                    var dataItem = data[i];

                    dataItem['imagenUrl'] =
                        processImage(dataItem['imagen']);

                    flattenLocationProperties(dataItem);
                }
            },
            error: function (e) {

                if (e.xhr) {
                    alert(JSON.stringify(e.xhr));
                }
            },
            schema: {
                model: {
                    fields: {
                        'nombre': {
                            field: 'nombre',
                            defaultValue: ''
                        },
                        'presentacion': {
                            field: 'presentacion',
                            defaultValue: ''
                        },
                        'imagen': {
                            field: 'imagen',
                            defaultValue: ''
                        },
                    }
                }
            },
            serverFiltering: true,
            serverSorting: true,
            serverPaging: true,
            pageSize: 50
        },
        dataSource = new kendo.data.DataSource(dataSourceOptions),
        productoSelectedModel = kendo.observable({
            dataSource: dataSource,
            searchChange: function (e) {
                var searchVal = e.target.value,
                    searchFilter;

                if (searchVal) {
                    searchFilter = {
                        field: 'nombre',
                        operator: 'contains',
                        value: searchVal
                    };
                }

                fetchFilteredData(productoSelectedModel.get('paramFilter'), searchFilter);

            },
            fixHierarchicalData: function (data) {
                var result = {},
                    layout = {};

                $.extend(true, result, data);

                (function removeNulls(obj) {
                    var i, name,
                        names = Object.getOwnPropertyNames(obj);

                    for (i = 0; i < names.length; i++) {
                        name = names[i];

                        if (obj[name] === null) {
                            delete obj[name];
                        } else if ($.type(obj[name]) === 'object') {
                            removeNulls(obj[name]);
                        }
                    }
                })(result);

                (function fix(source, layout) {
                    var i, j, name, srcObj, ltObj, type,
                        names = Object.getOwnPropertyNames(layout);

                    for (i = 0; i < names.length; i++) {
                        name = names[i];
                        srcObj = source[name];
                        ltObj = layout[name];
                        type = $.type(srcObj);

                        if (type === 'undefined' || type === 'null') {
                            source[name] = ltObj;
                        } else {
                            if (srcObj.length > 0) {
                                for (j = 0; j < srcObj.length; j++) {
                                    fix(srcObj[j], ltObj[0]);
                                }
                            } else {
                                fix(srcObj, ltObj);
                            }
                        }
                    }
                })(result, layout);

                return result;
            },
            itemClick: function (e) {
                var dataItem = e.dataItem || productoSelectedModel.originalItem;
				
                console.log(dataItem.uid);
                app.mobileApp.navigate('#components/producto/details.html?uid=' + dataItem.uid);

            },
            detailsShow: function (e) {
                console.log(123);
                productoSelectedModel.setCurrentItemByUid(e.view.params.uid);
            },
            setCurrentItemByUid: function (uid) {
                var item = uid,
                    dataSource = productoSelectedModel.get('dataSource'),
                    itemModel = dataSource.getByUid(item);
                
                console.log(dataSource);
                itemModel.imagenUrl = processImage(itemModel.imagen);

                if (!itemModel.nombre) {
                    itemModel.nombre = String.fromCharCode(160);
                }

                productoSelectedModel.set('originalItem', itemModel);
                productoSelectedModel.set('currentItem',
                    productoSelectedModel.fixHierarchicalData(itemModel));

                return itemModel;
            },
            linkBind: function (linkString) {
                var linkChunks = linkString.split('|');
                if (linkChunks[0].length === 0) {
                    return this.get("currentItem." + linkChunks[1]);
                }
                return linkChunks[0] + this.get("currentItem." + linkChunks[1]);
            },
            imageBind: function (imageField) {
                if (imageField.indexOf("|") > -1) {
                    return processImage(this.get("currentItem." + imageField.split("|")[0]));
                }
                return processImage(imageField);
            },
            ordenar: function (tipo, orden) {
                console.log("tipo-orden: " + tipo + "-" + orden);
                dataSource.sort({
                    field: tipo,
                    dir: orden
                })
            },
            currentItem: {}
        });

    if (typeof dataProvider.sbProviderReady === 'function') {
        dataProvider.sbProviderReady(function dl_sbProviderReady() {
            parent.set('productoSelectedModel', productoSelectedModel);
        });
    } else {
        parent.set('productoSelectedModel', productoSelectedModel);
    }

    parent.set('onShow', function (e) {
        /*Cargar lista de productos*/
        var param = e.view.params.filter ? JSON.parse(e.view.params.filter) : null,
            isListmenu = false,
            backbutton = e.view.element && e.view.element.find('header [data-role="navbar"] .backButtonWrapper');

        if (param || isListmenu) {
            backbutton.show();
            backbutton.css('visibility', 'visible');
        } else {
            if (e.view.element.find('header [data-role="navbar"] [data-role="button"]').length) {
                backbutton.hide();
            } else {
                backbutton.css('visibility', 'hidden');
            }
        }

        fetchFilteredData(param);
        /**/
    });

})(app.productoSelected);