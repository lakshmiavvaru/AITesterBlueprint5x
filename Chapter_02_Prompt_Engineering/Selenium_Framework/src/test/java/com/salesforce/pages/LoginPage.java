package com.salesforce.pages;

import io.qameta.allure.Step;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class LoginPage {

    private static final String LOGIN_URL = "https://login.salesforce.com/?locale=in";

    private final WebDriver driver;
    private final WebDriverWait wait;

    @FindBy(xpath = "//a[contains(normalize-space(.),'Log In with Username')]")
    private WebElement useUsernameLink;

    @FindBy(xpath = "//input[@id='username']")
    private WebElement username;

    @FindBy(xpath = "//input[@id='password']")
    private WebElement password;

    @FindBy(xpath = "//input[@id='Login']")
    private WebElement loginButton;

    @FindBy(xpath = "//input[@id='rememberUn']")
    private WebElement rememberMe;

    @FindBy(xpath = "//div[@id='error' and contains(@class,'loginError')]")
    private WebElement errorMessage;

    public LoginPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(30));
        PageFactory.initElements(driver, this);
    }

    @Step("Open Salesforce login page and switch to username login")
    public void open() {
        try {
            driver.get(LOGIN_URL);
            wait.until(ExpectedConditions.elementToBeClickable(useUsernameLink)).click();
            wait.until(ExpectedConditions.visibilityOf(username));
        } catch (TimeoutException | NoSuchElementException e) {
            throw new IllegalStateException("Salesforce login page did not load as expected", e);
        }
    }

    @Step("Login with username and password")
    public void doLogin(String user, String pass) {
        try {
            wait.until(ExpectedConditions.visibilityOf(username)).clear();
            username.sendKeys(user);
            loginButton.click();
            wait.until(ExpectedConditions.visibilityOf(password)).clear();
            password.sendKeys(pass);
            wait.until(ExpectedConditions.elementToBeClickable(loginButton)).click();
        } catch (TimeoutException | NoSuchElementException e) {
            throw new IllegalStateException("Unable to complete the login action", e);
        }
    }

    @Step("Toggle the Remember me checkbox")
    public void toggleRememberMe() {
        try {
            wait.until(ExpectedConditions.elementToBeClickable(rememberMe)).click();
        } catch (TimeoutException | NoSuchElementException e) {
            throw new IllegalStateException("Remember me checkbox is not available", e);
        }
    }

    public boolean isRememberMeSelected() {
        try {
            return wait.until(ExpectedConditions.visibilityOf(rememberMe)).isSelected();
        } catch (TimeoutException | NoSuchElementException e) {
            throw new IllegalStateException("Remember me checkbox is not available", e);
        }
    }

    public boolean isUsernameFieldDisplayed() {
        try {
            return wait.until(ExpectedConditions.visibilityOf(username)).isDisplayed();
        } catch (TimeoutException | NoSuchElementException e) {
            return false;
        }
    }

    public boolean isLoginButtonDisplayed() {
        try {
            return wait.until(ExpectedConditions.visibilityOf(loginButton)).isDisplayed();
        } catch (TimeoutException | NoSuchElementException e) {
            return false;
        }
    }

    public String getErrorMessage() {
        try {
            return wait.until(ExpectedConditions.visibilityOf(errorMessage)).getText();
        } catch (TimeoutException | NoSuchElementException e) {
            throw new IllegalStateException("Login error message was not displayed", e);
        }
    }

    public boolean hasLeftLoginPage() {
        try {
            return wait.until(ExpectedConditions.not(ExpectedConditions.urlContains("login.salesforce.com")));
        } catch (TimeoutException e) {
            return false;
        }
    }
}
