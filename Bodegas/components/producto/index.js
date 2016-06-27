'use strict';

app.producto = kendo.observable({
    onShow: function () {},
    afterShow: function () {},
});

// START_CUSTOM_CODE_producto
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_producto
(function (parent) {
    var dataProvider = app.data.bodegas,
        fetchFilteredData = function (paramFilter, searchFilter) {
            var model = parent.get('productoModel'),
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
                dataProvider: dataProvider,
                read: {
                    headers: {
                        "X-Everlive-Expand": JSON.stringify({
                            "categorias": {
                                "TargetTypeName": "categoria",
                                "ReturnAs": "categoriaExpanded",
                                "SingleField": "nombre" 
                            },
                            "id_marca": {
                                "TargetTypeName": "marca",
                                "ReturnAs": "marcaExpanded",
                                "SingleField": "nombre"
                            },
                        })
                    }
                }
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
            serverGrouping: true,
            pageSize: 50
        },
        dataSource = new kendo.data.DataSource(dataSourceOptions),
        productoModel = kendo.observable({
            dataSource: dataSource,
            searchChange: function (e) {

                var searchVal = e.target.value,
                    searchFilter;

                if (searchVal.length < 4) {
                    $("#listadoProductosAutocomplete").css("display", "none");
                    $("#listadoCategorias").css("display", "block");
                    return;
                }
                if (searchVal) {
                    $("#listadoProductosAutocomplete").css("display", "block");
                    $("#listadoCategorias").css("display", "none");
                    searchFilter = {
                        field: 'nombre',
                        operator: 'contains',
                        value: searchVal
                    };
                } else {
                    $("#listadoProductosAutocomplete").css("display", "none");
                    $("#listadoCategorias").css("display", "block");

                }
                fetchFilteredData(productoModel.get('paramFilter'), searchFilter);

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
                var dataItem = e.dataItem || productoModel.originalItem;

                // app.mobileApp.navigate('#components/producto/details.html?uid=' + dataItem.uid);

                console.log(e.dataItem.nombre);
                app.mobileApp.navigate('#components/producto/productoSelected.html?filter=' + encodeURIComponent(JSON.stringify({
                    field: 'categorias',
                    value: e.dataItem.categorias,
                    operator: 'eq'
                })));

            },
            detailsShow: function (e) {
                productoModel.setCurrentItemByUid(e.view.params.uid);
            },
            setCurrentItemByUid: function (uid) {
                var item = uid,
                    dataSource = productoModel.get('dataSource'),
                    itemModel = dataSource.getByUid(item);

                console.log(dataSource);

                itemModel.imagenUrl = processImage(itemModel.imagen);

                if (!itemModel.nombre) {
                    itemModel.nombre = String.fromCharCode(160);
                }

                productoModel.set('originalItem', itemModel);
                productoModel.set('currentItem',
                    productoModel.fixHierarchicalData(itemModel));

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
            currentItem: {}
        });

    if (typeof dataProvider.sbProviderReady === 'function') {
        dataProvider.sbProviderReady(function dl_sbProviderReady() {
            parent.set('productoModel', productoModel);
        });
    } else {
        parent.set('productoModel', productoModel);
    }

    parent.set('onInit', function (e) {
        /*Cargar lista de categorías*/
        $("#listadoCategorias").kendoMobileListView({
                dataSource: app.categoria.categoriaModel.dataSource,
                template: kendo.template($("#listadoCategoriasTemplate").html()),
            })
            /**/
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

})(app.producto);

// START_CUSTOM_CODE_productoModel
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_productoModel