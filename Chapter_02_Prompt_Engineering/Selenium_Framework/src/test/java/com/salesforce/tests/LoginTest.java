package com.salesforce.tests;

import com.salesforce.pages.LoginPage;
import io.qameta.allure.Description;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import io.qameta.allure.Story;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.testng.Assert;
import org.testng.SkipException;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

@Epic("Salesforce")
@Feature("Login")
public class LoginTest {

    private static final String EXPECTED_ERROR = "Please check your username and password";

    private WebDriver driver;
    private LoginPage loginPage;

    @BeforeMethod
    public void setUp() {
        try {
            ChromeOptions options = new ChromeOptions();
            options.addArguments("--start-maximized");
            driver = new ChromeDriver(options);
            loginPage = new LoginPage(driver);
            loginPage.open();
        } catch (WebDriverException | IllegalStateException e) {
            tearDown();
            throw new IllegalStateException("Browser setup failed", e);
        }
    }

    @AfterMethod(alwaysRun = true)
    public void tearDown() {
        try {
            if (driver != null) {
                driver.quit();
            }
        } catch (WebDriverException e) {
            driver = null;
        } finally {
            driver = null;
        }
    }

    @DataProvider(name = "invalidCredentials")
    public Object[][] invalidCredentials() {
        return new Object[][]{
                {"invalid.user@example.com", "WrongPassword@123"},
                {"another.invalid@example.org", "Incorrect#456"}
        };
    }

    @Test(priority = 1)
    @Story("Login page UI")
    @Severity(SeverityLevel.NORMAL)
    @Description("Username field and Log In button are displayed on the login page")
    public void loginPageElementsAreDisplayed() {
        Assert.assertTrue(loginPage.isUsernameFieldDisplayed(), "Username field is not displayed");
        Assert.assertTrue(loginPage.isLoginButtonDisplayed(), "Log In button is not displayed");
    }

    @Test(priority = 2)
    @Story("Remember me")
    @Severity(SeverityLevel.MINOR)
    @Description("Remember me checkbox can be selected and cleared")
    public void rememberMeCheckboxCanBeToggled() {
        Assert.assertFalse(loginPage.isRememberMeSelected(), "Remember me is selected by default");
        loginPage.toggleRememberMe();
        Assert.assertTrue(loginPage.isRememberMeSelected(), "Remember me was not selected");
        loginPage.toggleRememberMe();
        Assert.assertFalse(loginPage.isRememberMeSelected(), "Remember me was not cleared");
    }

    @Test(priority = 3, dataProvider = "invalidCredentials")
    @Story("Invalid login")
    @Severity(SeverityLevel.CRITICAL)
    @Description("Invalid credentials show an error message and keep the user on the login page")
    public void invalidLoginShowsErrorMessage(String user, String pass) {
        loginPage.doLogin(user, pass);
        Assert.assertTrue(loginPage.getErrorMessage().contains(EXPECTED_ERROR),
                "Unexpected error message for invalid credentials");
        Assert.assertTrue(driver.getCurrentUrl().contains("login.salesforce.com"),
                "User left the login page with invalid credentials");
    }

    @Test(priority = 4)
    @Story("Valid login")
    @Severity(SeverityLevel.BLOCKER)
    @Description("Valid credentials from SF_USERNAME and SF_PASSWORD log the user in")
    public void validLoginRedirectsAwayFromLoginPage() {
        String user = System.getenv("SF_USERNAME");
        String pass = System.getenv("SF_PASSWORD");
        if (user == null || user.isBlank() || pass == null || pass.isBlank()) {
            throw new SkipException("Insufficient information to determine. Set SF_USERNAME and SF_PASSWORD.");
        }
        loginPage.doLogin(user, pass);
        Assert.assertTrue(loginPage.hasLeftLoginPage(), "User was not redirected after a valid login");
    }
}
