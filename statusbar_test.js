/*global describe it before after  =*/

require(["lib/architect/architect", "lib/chai/chai"], function (architect, chai) {
    var expect = chai.expect;
    
    architect.resolveConfig([
        {
            packagePath : "plugins/c9.core/c9",
            workspaceId : "ubuntu/ip-10-35-77-180",
            startdate   : new Date(),
            debug       : true,
            smithIo     : "{\"prefix\":\"/smith.io/server\"}",
            hosted      : true,
            local       : false,
            davPrefix   : "/"
        },
        
        "plugins/c9.core/ext",
        "plugins/c9.core/events",
        "plugins/c9.core/http",
        "plugins/c9.core/util",
        "plugins/c9.ide.ui/lib_apf",
        "plugins/c9.core/settings",
        {
            packagePath  : "plugins/c9.ide.ui/ui",
            staticPrefix : "plugins/c9.ide.ui"
        },
        "plugins/c9.ide.editors/document",
        "plugins/c9.ide.editors/undomanager",
        {
            packagePath: "plugins/c9.ide.editors/editors",
            defaultEditor: "ace"
        },
        "plugins/c9.ide.editors/editor",
        "plugins/c9.ide.editors/tabs",
        "plugins/c9.ide.editors/pane",
        "plugins/c9.ide.editors/page",
        "plugins/c9.ide.ace/ace",
        {
            packagePath  : "plugins/c9.ide.ace.statusbar/statusbar",
            staticPrefix : "plugins/c9.ide.layout.classic"
        },
        "plugins/c9.ide.keys/commands",
        "plugins/c9.fs/proc",
        {
            packagePath: "plugins/c9.vfs.client/vfs_client",
            smithIo     : {
                "prefix": "/smith.io/server"
            }
        },
        "plugins/c9.ide.auth/auth",
        "plugins/c9.fs/fs",
        
        // Mock plugins
        {
            consumes : ["emitter", "apf", "ui"],
            provides : [
                "commands", "menus", "layout", "watcher", 
                "save", "preferences", "anims", "gotoline", "clipboard"
            ],
            setup    : expect.html.mocked
        },
        {
            consumes : ["tabs", "ace"],
            provides : [],
            setup    : main
        }
    ], function (err, config) {
        if (err) throw err;
        var app = architect.createApp(config);
        app.on("service", function(name, plugin){ plugin.name = name; });
    });
    
    function main(options, imports, register) {
        var tabs    = imports.tabs;
        var ace     = imports.ace;
        
        function getPageHtml(page){
            return page.pane.aml.getPage("editor::" + page.editorType).$ext
        }
        
        expect.html.setConstructor(function(page){
            if (typeof page == "object")
                return page.$ext;
        });
        
        describe('statusbar', function() {
            before(function(done){
                apf.config.setProperty("allow-select", false);
                apf.config.setProperty("allow-blur", false);
                tabs.getTabs()[0].focus();
                
                bar.$ext.style.background = "rgba(220, 220, 220, 0.93)";
                bar.$ext.style.position = "fixed";
                bar.$ext.style.left = "20px";
                bar.$ext.style.right = "20px";
                bar.$ext.style.bottom = "20px";
                bar.$ext.style.height = "33%";
      
                document.body.style.marginBottom = "33%";
                done();
            });
            
            describe("open", function(){
                this.timeout(10000);
                
                it('should open a pane with just an editor', function(done) {
                    tabs.openFile("/file.txt", function(err, page){
                        expect(tabs.getPages()).length(1);
                        
                        var sb  = page.document.getSession().statusBar;
                        var bar = sb.getElement("bar");
                        expect.html(bar, "rowcol").text("1:1");
                        
                        page.document.editor.ace.selectAll();
                        setTimeout(function(){
                            expect.html(bar, "rowcol sel").text("2:1");
                            expect.html(bar, "sel").text("23 Bytes");
                            
                            done();
                        }, 100);
                    });
                });
                it('should handle multiple documents in the same pane', function(done) {
                    tabs.openFile("/listing.json", function(err, page){
                        expect(tabs.getPages()).length(2);
                        
                        page.activate();
                        
                        setTimeout(function(){
                            var sb = page.document.getSession().statusBar;
                            expect.html(sb.getElement("bar"), "caption").text("1:1");
                            
                            done();
                        }, 100);
                    });
                });
            });
            describe("split(), pane.unload()", function(){
                it('should split a pane horizontally, making the existing pane the left one', function(done) {
                    var pane = tabs.focussedPage.pane;
                    var righttab = pane.hsplit(true);
                    tabs.focussedPage.attachTo(righttab);
                    
                    setTimeout(function(){
                        expect.html(pane.aml, "pane").text("2:1");
                        expect.html(righttab.aml, "righttab").text("1:1");
                    
                        done();
                    }, 100);
                });
//                it('should remove the left pane from a horizontal split', function(done) {
//                    var pane  = tabs.getTabs()[0];
//                    var page = tabs.getTabs()[1].getPage();
//                    pane.unload();
//                    expect(tabs.getTabs()).length(1);
//                    expect(tabs.getPages()).length(2);
//                    tabs.focusPage(page);
//                    done();
//                });
            });
//            describe("Change Theme", function(){
//                this.timeout(10000);
//                
//                it('should change a theme', function(done) {
//                    var editor = tabs.focussedPage.editor;
//                    ace.on("themeInit", function setTheme(){
//                        ace.off("theme.init", setTheme);
//                        expect.html(getPageHtml(tabs.focussedPage).childNodes[1]).className("ace-monokai");
//                        editor.setOption("theme", "ace/theme/textmate");
//                        done();
//                    });
//                    editor.setOption("theme", "ace/theme/monokai");
//                });
//            });
            
            // @todo test split api and menu
            
           if (!onload.remain){
               after(function(done){
                   tabs.unload();
                   
                   document.body.style.marginBottom = "";
                   done();
               });
           }
        });
        
        onload && onload();
    }
});