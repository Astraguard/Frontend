import os

def test_security_policy():
    assert os.path.exists("SECURITY.md"), "SECURITY.md file missing"
    with open("SECURITY.md", "r", encoding="utf-8") as f:
        content = f.read()
    assert "Reporting Vulnerabilities" in content
    assert "GitHub Security Advisories" in content
    print("✅ SECURITY.md validation passed")

if __name__ == "__main__":
    test_security_policy()
