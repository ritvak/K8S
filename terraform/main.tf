provider "google" {
  credentials = file("application_default_credentials.json")
  project = "kubernetes-5409"
  region  = "us-central1"
}

resource "google_container_cluster" "cluster" {
  name     = "ritva-cluster"
  location = "us-central1"

  initial_node_count = 1

  node_config {
    machine_type = "e2-small"
    disk_size_gb = 10
    disk_type    = "pd-standard"
  }
}
