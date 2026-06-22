import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.data.generators.db_seeder import seed_database

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Seed the database before running tests."""
    seed_database()
    yield

def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_get_fleet_health():
    response = client.get("/api/fleet/health")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "id" in data[0]

def test_get_planner_readiness():
    response = client.get("/api/fleet/planner")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "readiness_score" in data[0]

def test_get_supply_chain():
    response = client.get("/api/supply-chain")
    assert response.status_code == 200
    data = response.json()
    assert "nodes" in data
    assert "edges" in data
    assert len(data["nodes"]) > 0

def test_get_carbon_intelligence():
    response = client.get("/api/carbon")
    assert response.status_code == 200
    data = response.json()
    assert "current_ev_count" in data
    assert "top_candidates" in data
