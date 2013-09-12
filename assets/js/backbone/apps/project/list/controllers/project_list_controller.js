define([
	'underscore',
	'backbone',
	'bootstrap',
	'utilities',
	'base_controller',
	'projects_collection',
	'projects_collection_view',
	'projects_show_controller',
	'project_form_view',
	'projects_app',
	'modal_component',
	'project_edit_form_view',
	'autocomplete',
	'search_model',
	'search_result_item_view',
	'text!template_name'
], function (
	_, Backbone, Bootstrap, Utilities, BaseController, 
	ProjectsCollection, ProjectsCollectionView, ProjectShowController, 
	ProjectFormView, ProjectApp, ModalComponent, ProjectEditFormView, midasAutocomplete,
	SearchModel, SearchResultItemView) {
	
	Application.Project.ListController = BaseController.extend({

		el: "#container",

		events: {
			"click .project"				: "show",
			"click .add-project"		: "add",
			"click .edit-project"		: "edit",
			"click .delete-project"	: "delete",
			"keyup .search"					: "search"
		},

		initialize: function () {
			var self = this;

			this.fireUpProjectsCollection();
			this.bindToProjectFetchListeners();
			this.collection.trigger("projects:fetch");

			this.listenTo(this.collection, "project:save:success", function () {
				$(".modal-backdrop").hide();
      	$(".modal").modal('hide');
      	self.renderProjectCollectionView();
			})
		},

		fireUpProjectsCollection: function () {
			if (this.collection) {
				this.collection;
			} else {
				this.collection = new ProjectsCollection();
			}
		},

		bindToProjectFetchListeners: function () {
			var self = this;
			this.listenToOnce(this.collection, "projects:fetch", function () {
				self.collection.fetch({
					success: function (collection) {
						self.renderProjectCollectionView(collection);
					}
				})
			})
		},

		renderProjectCollectionView: function (collection) {
			this.projectCollectionView ?	
				this.projectCollectionView.render() :
				this.projectCollectionView = new ProjectsCollectionView({
					el: "#container",
					onRender: true,
					collection: collection
				}).render();
		},

		// -----------------------
		//= BEGIN CLASS METHODS
		// -----------------------
		show: function (e) {
			if (e.preventDefault()) e.preventDefault();

			var attr 	= $(e.currentTarget).closest(".project-title").children(".project").text(),
					model = getCurrentModelFromFormAttributes(this.collection, attr);

			if (this.projectShowController) this.projectShowController.cleanup();
			this.projectShowController = new ProjectShowController({ model: model })
		},

		add: function (e) {
			if (e.preventDefault()) e.preventDefault();
			var self = this;

      if (this.modalComponent) this.modalComponent;
      this.modalComponent = new ModalComponent({
        el: "#container",
        id: "addProject",
        modalTitle: "Add Project"
      }).render();  

      if (!_.isUndefined(this.modalComponent)) {
        if (this.projectFormView) this.projectFormView();
        this.projectFormView = new ProjectFormView({
          el: ".modal-body",
          collection: self.collection
        }).render();
      }

		},

		search: function (e) {
			var enterKey = 13;

			// If they hit the enter key to turn off the default alert that pops up, then
			// don't allow that to continually bubble the autcomplete (which would otherwise cause a loop).
			// This enter key stops it.
			if (e.keyCode === enterKey) return;

			// So far we can pass to this plugin:
			// Backbone params: 
			// 	backboneEvents: true/false,
			// 	backbone: {
			// 		view: 'viewName',
			// 		model: 'modelName'
			// 	}
			// NonBackbone params:
			// 	on: 'keyup/keydown/click/etc',
			// 	apiEndpoint: '/some/server/path?query=',
			// 	type: 'POST/GET/etc',
			// 	contentType: 'json', 'jsonp', 'html',
			// 	searchResultsClass: '.class-name-of-wrapper-for-search-results'
			// 	
			// Note: You can use this with the backbone eventing system, by delegating your input element 
			// to a backbone event on keypress/keyup, etc, and then in the function caller for that initialize this 
			// plugin.  It needs to be initialized in line on the keyup, because the function does a check and then goes out
			// to the server on each keypress.
			
			// BACKBONE IMPLEMENTATION
			// var _this = this;
			// $(".search").midasAutocomplete({
			// 	backbone: {
			// 		model: SearchModel,
			// 		view: SearchResultItemView
			// 	},

			// 	backboneEvents: true,

			// 	// NO NEED here for apiendpoint on backbone
			// 	// because we are going to let them craft it on their own

			// 	// apiEndpoint: '/ac/inline',
			// 	// This defines wether save or fetch
			// 	type: 'GET',
			// 	trigger: false,
			// 	searchResultsClass: ".search-result-wrapper"
			// })

			// AJAX IMPLEMENTATION
			$(".search").midasAutocomplete({
				backboneEvents: true,
				// If we are using backbone here, then a lot of these 
				// misc. AJAX options we are passing are unecessary.  So we should somehow
				// manage that in an elegant way.  
				backbone: false,
				apiEndpoint: '/ac/inline',
				// the query param expects one api endpoint IE:
				// /nested/endpoint?QUERYPARAM=$(".search").val()
				// So it is not something that you can chain params onto.  
				// It expects you to send the data back as input data through that query param
				// one character at a time.  
				queryParam: 'q',
				type: 'POST',
				contentType: 'json',

				// The plugin will accept any trigger key'd in here, and then
				// use that to start the search process.  if it doesn't exist it will not search.
				trigger: "@",
				searchResultsClass: ".search-result-wrapper",

				success: function (data) {

				}
			});



		},

		// ---------------------
		//= UTILITY METHODS
		// ---------------------
		cleanup: function() {
		  $(this.el).remove();
		}

	});

	return Application.Project.ListController;
})