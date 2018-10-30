function User() {
	var logged = false;
	var password = "";
	var groupName = "";
	var id = 0;

	this.login = function() {
		this.groupName = document.getElementById("name").value;
		this.password = document.getElementById("password").value;
	}

	this.setLogged = function(flag) {
		this.logged = flag;
	}

	this.deleteLogin = function() {
		var elem = document.getElementById('loginForm');
		elem.innerHTML = "";
		document.getElementsByTagName("body")[0].style = "background-color: #9fa3a5;";
	}

	this.getGroupName = function() {
		return this.groupName;
	}

	this.getPass = function() {
		return this.password;
	}

	this.isLogged = function() {
		return this.logged;
	}
}
