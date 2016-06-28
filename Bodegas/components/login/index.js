'use strict';

app.login = kendo.observable({
    onShow: function() {},
    afterShow: function() {}
});

// START_CUSTOM_CODE_login
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_login
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
                model = parent.loginModel;

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
                model = parent.loginModel || {},
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
        loginModel = kendo.observable({
            displayName: '',
            email: '',
            password: '',
            validateData: function(data) {
                if (!data.email) {
                    alert('Missing email');
                    return false;
                }

                if (!data.password) {
                    alert('Missing password');
                    return false;
                }

                return true;
            },
            signin: function() {
                var model = loginModel,
                    email = model.email.toLowerCase(),
                    password = model.password;

                if (!model.validateData(model)) {
                    return false;
                }
                provider.Users.login(email, password, successHandler, init);
            },
            register: function() {
                var model = loginModel,
                    email = model.email.toLowerCase(),
                    password = model.password,
                    displayName = model.displayName,
                    attrs = {
                        Email: email,
                        DisplayName: displayName
                    };

                if (!model.validateData(model)) {
                    return false;
                }

                provider.Users.register(email, password, attrs, successHandler, init);
            },
            toggleView: function() {
                // mode = mode === 'signin' ? 'register' : 'signin';
                // init();
                app.mobileApp.navigate('components/login/usuario.html');
            }
        });

    parent.set('loginModel', loginModel);
    parent.set('afterShow', function(e) {
        if (e && e.view && e.view.params && e.view.params.logout) {
            loginModel.set('logout', true);
        }
        provider.Users.currentUser().then(successHandler, init);
    });
})(app.login);

// START_CUSTOM_CODE_loginModel
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_loginModel