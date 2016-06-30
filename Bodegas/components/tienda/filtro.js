'use strict';

app.filtro = kendo.observable({
    dataInit: function () {
        $("#btn-modalview-alert").removeAttr("onclick");
        //cargamos ds departamentos 
        var dsDepartamento = app.departamento.departamentoModel.dataSource;
        dsDepartamento.fetch(function () {
            var html = [];
            var data = dsDepartamento.data();
            for (var i = 0; i < data.length; i++) {
                html.push('<option value="' + data[i].Id + '">' + data[i].nombre + '</option>');
            }
            $("#departamento-select-filtro").html(html);
        });
        //cargamos ds provincias 
        var dsProvincia = app.provincia.provinciaModel.dataSource;
        dsProvincia.fetch(function () {
            var html = [];
            var data = dsProvincia.data();
            for (var i = 0; i < data.length; i++) {
                html.push('<option value="' + data[i].Id + '">' + data[i].nombre + '</option>');
            }
            $("#provincia-select-filtro").html(html);
        });
        //cargamos ds distritos 
        var dsDistrito = app.distrito.distritoModel.dataSource;
        dsDistrito.fetch(function () {
            var html = [];
            var data = dsDistrito.data();
            for (var i = 0; i < data.length; i++) {
                html.push('<option value="' + data[i].Id + '">' + data[i].nombre + '</option>');
            }
            $("#distrito-select-filtro").html(html);
        });
        $("#btn-modalview-alert").attr("onclick", "openModal('modalview-alert')");
    },
    goToTienda: function () {
        console.log($("#distrito-select-filtro option:selected").val());
        app.mobileApp.navigate('components/tienda/view.html'); 
        // app.mobileApp.navigate('components/tienda/view.html?filter=' + encodeURIComponent(JSON.stringify({
        //     field: 'distritoExpanded',
        //     value: $("#distrito-select-filtro option:selected").val(),
        //     operator: 'eq'
        // })));
    },
    onShow: function () {},
    afterShow: function () {}
});