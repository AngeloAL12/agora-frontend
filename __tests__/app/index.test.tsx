import { render } from "@testing-library/react-native";
import Index from "../../app/index";

describe("Index Screen", () => {
  it("renderiza el texto correctamente", () => {
    const { getByText } = render(<Index />);

    expect(getByText("Edit app/index.tsx to edit this screen.")).toBeTruthy();
  });
});
