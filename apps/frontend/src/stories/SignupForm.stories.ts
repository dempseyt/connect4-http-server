import { Meta, StoryObj } from "@storybook/react";
import { fn, userEvent, within } from "@storybook/test";
import SignupForm from "../components/SignupForm";

const meta = {
  component: SignupForm,
} satisfies Meta<typeof SignupForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TheOneWithDefaults: Story = {};

export const TheOneWithASignupHandler: Story = {
  args: {
    signupHandler: fn((signupDetails) => signupDetails),
  },
};

// ---------------- STORIES FOR ONCE LOGIN HANDLER HAS FIRED ---------------------------

export const TheOneWithEmptyFields: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const loginButton = canvas.getByRole("button");
    await userEvent.click(loginButton);
  },
};

export const TheOneWithMissingFirstNameField: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const lastNameInput = canvas.getByPlaceholderText("Last name");
    const emailInput = canvas.getByPlaceholderText("Email");
    const passwordInput = canvas.getByPlaceholderText("Password");
    await userEvent.type(lastNameInput, "Henry");
    await userEvent.type(emailInput, "jon@mail.com");
    await userEvent.type(passwordInput, "blah");
    const loginButton = canvas.getByRole("button");
    await userEvent.click(loginButton);
  },
};

export const TheOneWithMissingLastNameField: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const firstNameInput = canvas.getByPlaceholderText("First name");
    const emailInput = canvas.getByPlaceholderText("Email");
    const passwordInput = canvas.getByPlaceholderText("Password");
    await userEvent.type(firstNameInput, "Jon");
    await userEvent.type(emailInput, "jon@mail.com");
    await userEvent.type(passwordInput, "blah");
    const loginButton = canvas.getByRole("button");
    await userEvent.click(loginButton);
  },
};

export const TheOneWithMissingEmailField: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const firstNameInput = canvas.getByPlaceholderText("First name");
    const lastNameInput = canvas.getByPlaceholderText("Last name");
    const passwordInput = canvas.getByPlaceholderText("Password");
    await userEvent.type(firstNameInput, "Jon");
    await userEvent.type(lastNameInput, "Henry");
    await userEvent.type(passwordInput, "blah");
    const loginButton = canvas.getByRole("button");
    await userEvent.click(loginButton);
  },
};

export const TheOneWithMissingPasswordField: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const firstNameInput = canvas.getByPlaceholderText("First name");
    const lastNameInput = canvas.getByPlaceholderText("Last name");
    const emailInput = canvas.getByPlaceholderText("Email");
    await userEvent.type(firstNameInput, "Jon");
    await userEvent.type(lastNameInput, "Henry");
    await userEvent.type(emailInput, "jon@mail.com");
    const loginButton = canvas.getByRole("button");
    await userEvent.click(loginButton);
  },
};

export const TheOneWithAnInvalidEmail: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const firstNameInput = canvas.getByPlaceholderText("First name");
    const lastNameInput = canvas.getByPlaceholderText("Last name");
    const emailInput = canvas.getByPlaceholderText("Email");
    const passwordInput = canvas.getByPlaceholderText("Password");
    await userEvent.type(firstNameInput, "Jon");
    await userEvent.type(lastNameInput, "Henry");
    await userEvent.type(emailInput, "mail.com");
    await userEvent.type(passwordInput, "password123$");
    const loginButton = canvas.getByRole("button");
    await userEvent.click(loginButton);
  },
};

// ---------------- STORIES AFTER LOGIN HANDLER HAS FIRED ---------------------------

const fillOutLoginFormCorrectly = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const firstNameInput = canvas.getByPlaceholderText("First name");
  const lastNameInput = canvas.getByPlaceholderText("Last name");
  const emailInput = canvas.getByPlaceholderText("Email");
  const passwordInput = canvas.getByPlaceholderText("Password");
  await userEvent.type(firstNameInput, "Jon");
  await userEvent.type(lastNameInput, "Henry");
  await userEvent.type(emailInput, "jon@mail.com");
  await userEvent.type(passwordInput, "password123$");
  return canvas;
};

export const TheOneWithAPendingLogin: Story = {
  args: {
    signupHandler: fn(
      () =>
        new Promise<void>((resolve) =>
          setTimeout(() => {
            resolve();
          }, 3000)
        )
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = await fillOutLoginFormCorrectly(canvasElement);
    const loginButton = canvas.getByRole("button");
    await userEvent.click(loginButton);
  },
};

export const TheOneWithAnUnsuccessfulLogin: Story = {
  args: {
    signupHandler: fn(
      () =>
        new Promise<"FAILED">((resolve) =>
          setTimeout(() => {
            resolve("FAILED");
          }, 2000)
        )
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = await fillOutLoginFormCorrectly(canvasElement);
    const loginButton = canvas.getByRole("button");
    await userEvent.click(loginButton);
  },
};

export const TheOneWithAnSuccessfulLogin: Story = {
  args: {
    signupHandler: fn(
      () =>
        new Promise<"SUCCESS">((resolve) =>
          setTimeout(() => {
            resolve("SUCCESS");
          }, 2000)
        )
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = await fillOutLoginFormCorrectly(canvasElement);
    const loginButton = canvas.getByRole("button");
    await userEvent.click(loginButton);
  },
};

// ---------------- STORIES FOR SIGN UP LINK ---------------------------

export const TheOneWithALoginRedirectHandler: Story = {
  args: {
    loginRedirectHandler: fn(() => Promise.resolve()),
  },
};
