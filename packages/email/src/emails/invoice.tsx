import {
  Body,
  Container,
  Heading,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { Logo } from "../components/logo";
import {
  Button,
  EmailThemeProvider,
  getEmailInlineStyles,
  getEmailThemeClasses,
} from "../components/theme";

interface Props {
  customerName: string;
  teamName: string;
  invoiceNumber: string;
  link: string;
  logoUrl?: string;
  companyName?: string;
}

export const InvoiceEmail = ({
  customerName = "Customer",
  teamName = "BaseOne",
  invoiceNumber = "INV-0001",
  link = "https://app.baseone.local/i/1234567890",
  logoUrl,
  companyName,
}: Props) => {
  const text = `You've Received Invoice ${invoiceNumber} from ${teamName}`;
  const themeClasses = getEmailThemeClasses();
  const lightStyles = getEmailInlineStyles("light");

  return (
    <EmailThemeProvider preview={<Preview>{text}</Preview>}>
      <Body
        className={`my-auto mx-auto font-sans ${themeClasses.body}`}
        style={lightStyles.body}
      >
        <Container
          className={`my-[40px] mx-auto p-[20px] max-w-[600px] ${themeClasses.container}`}
          style={{
            borderStyle: "solid",
            borderWidth: 1,
            borderRadius: 8,
            borderColor: lightStyles.container.borderColor,
          }}
        >
          <Logo logoUrl={logoUrl} companyName={companyName || teamName} />
          
          <Heading
            className={`text-[21px] font-normal text-center p-0 my-[30px] mx-0 ${themeClasses.heading}`}
            style={{ color: lightStyles.text.color }}
          >
            You've Received Invoice {invoiceNumber} <br /> from {teamName}
          </Heading>

          <br />

          <span
            className={`font-medium ${themeClasses.text}`}
            style={{ color: lightStyles.text.color }}
          >
            Hi {customerName},
          </span>
          <Text
            className={themeClasses.text}
            style={{ color: lightStyles.text.color }}
          >
            Thank you for your business. Please find your invoice attached and 
            review the details below. Payment is due according to the terms 
            specified in the invoice.
          </Text>

          <Text
            className={themeClasses.text}
            style={{ color: lightStyles.text.color }}
          >
            If you have any questions about this invoice or need assistance, 
            please don't hesitate to reply to this email or contact our support team.
          </Text>

          <Section className="text-center mt-[50px] mb-[50px]">
            <Button href={link}>View Invoice</Button>
          </Section>

          <Text
            className={`text-[12px] ${themeClasses.mutedText}`}
            style={{ color: lightStyles.mutedText.color }}
          >
            This email was sent by {teamName}. If you believe you received this 
            email in error, please contact us.
          </Text>

          <br />
        </Container>
      </Body>
    </EmailThemeProvider>
  );
};

export default InvoiceEmail;