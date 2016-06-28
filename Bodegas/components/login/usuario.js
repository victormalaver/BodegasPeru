'use strict';

app.usuario = kendo.observable({
    onShow: function() {},
    afterShow: function() {}
});

// START_CUSTOM_CODE_usuario
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_usuario
(function(parent) {
    var provider = app.data.bodegas,
        mode = 'signin',
        registerRedirect = 'producto',
        signinRedirect = 'producto',
        init = function(error) {
            if (error) {
                if (error.message) {
                    alert(error.message);
                }
                return false;
            }

            var activeView = mode === 'signin' ? '.signin-view' : '.signup-view',
                model = parent.usuarioModel;

            if (provider.setup && provider.setup.offlineStorage && !app.isOnline()) {
                $('.offline').show().siblings().hide();
            } else {
                $(activeView).show().siblings().hide();
            }

            if (model && model.set) {
                model.set('logout', null);
            }

        },
        successHandler = function(data) {
            var redirect = mode === 'signin' ? signinRedirect : registerRedirect,
                model = parent.usuarioModel || {},
                logout = model.logout;

            if (logout) {
                model.set('logout', null);
            }
            if (data && data.result) {
                if (logout) {
                    provider.Users.logout(init, init);
                    return;
                }
                app.user = data.result;

                setTimeout(function() {
                    app.mobileApp.navigate('components/' + redirect + '/view.html');
                }, 0);
            } else {
                init();
            }
        },
        usuarioModel = kendo.observable({
            displayName: '',
            apellido: '',
            email: '',
            password: '',
            password2: '',
            validateData: function(data) {
                if (!data.displayName) {
                    alert('Ingrese sus nombres');
                    return false;
                }
                
                if (!data.apellido) {
                    alert('Ingrese sus apellidos');
                    return false;
                }
                
                if (!data.email) {
                    alert('Ingrese un correo de contacto');
                    return false;
                }

                if (!data.password) {
                    alert('Error: Ingrese primera contraseña');
                    return false;
                }
                if (!data.password2) {
                    alert('Error: Ingrese segunda contraseña');
                    return false;
                }
                
                if (data.password !== data.password2) {
                    alert('Error: Contraseñas distintas');
                    return false;
                }

                return true;
            },
            register: function() {
                var model = usuarioModel,
                    email = model.email.toLowerCase(),
                    password = model.password,
                    displayName = model.displayName,
                    apellido = model.apellido,
                    attrs = {
                        Email: email,
                        DisplayName: displayName,
                        apellido: apellido
                    };

                if (!model.validateData(model)) {
                    return false;
                }

                provider.Users.register(email, password, attrs, successHandler, init);
            },
            toggleView: function() {
                mode = mode === 'signin' ? 'register' : 'signin';
                init();
            }
        });

    parent.set('usuarioModel', usuarioModel);
    parent.set('afterShow', function(e) {
        if (e && e.view && e.view.params && e.view.params.logout) {
            usuarioModel.set('logout', true);
        }
        provider.Users.currentUser().then(successHandler, init);
    });
})(app.usuario);

// START_CUSTOM_CODE_usuarioModel
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_usuarioModel