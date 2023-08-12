import dotenv from "dotenv";
import axios from "axios";
import puppeteer from "puppeteer";

dotenv.config();

async function getAuthenticationCookies({
  username,
  password,
}: {
  username: string;
  password: string;
}) {
  const browser = await puppeteer.launch({
    headless: true,
    userDataDir: "./user-data",
  });
  const page = await browser.newPage();
  await page.goto("https://qacademico.ifce.edu.br/qacademico/alunos");
  await page.type("#txtLogin", username);
  await page.type("#txtPassword", password);
  await page.click("#btnOk");
  await page.waitForNavigation();
  const cookies = await page.cookies();
  await browser.close();
  return cookies;
}

(async () => {
  const cookies = await getAuthenticationCookies({
    username: process.env.LOGIN || "",
    password: process.env.PASSWORD || "",
  });

  const parsedCookies = cookies
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  //console.log(await getDiary(parsedCookies));
  //console.log(await getRequestedDocuments(parsedCookies));
  console.log(await getDocumentTemplates(parsedCookies));
})();

async function getDiary(cookies: string) {
  const response = await axios.get(
    "https://qacademico.ifce.edu.br/webapp/api/diarios/aluno/diarios",
    {
      withCredentials: true,
      headers: {
        Cookie: cookies,
      },
    }
  );

  return response.data;
}

async function getRequestedDocuments(cookies: string) {
  const response = await axios.get(
    "https://qacademico.ifce.edu.br/webapp/api/documentos/aluno/solicitacoes-realizadas",
    {
      withCredentials: true,
      headers: {
        Cookie: cookies,
      },
    }
  );

  return response.data;
}

async function getDocumentTemplates(cookies: string) {
  const response = await axios.get(
    "https://qacademico.ifce.edu.br/webapp/api/documentos/aluno/modelos-de-documentos",
    {
      withCredentials: true,
      headers: {
        Cookie: cookies,
      },
    }
  );

  return response.data;
}

interface DocumentRequestProps {
  cookies: string;
  schoolYear: number;
  idModel: number;
  schoolPeriod: number;
  requiresCustomization: number;
}

interface DocumentRequestResponse {
  informationFile: {
    id: string;
    name: string;
  };
  requestMade: {
    id: string;
    name: string;
    dateOfRequest: string;
    situation: number;
    dateLimitDeLiberation: string | null;
    schoolYear: string | null;
    schoolPeriod: string | null;
    daysToRelease: number | null;
  };
}

async function getDocumentRequest({
  cookies,
  schoolYear,
  idModel,
  schoolPeriod,
  requiresCustomization,
}: DocumentRequestProps) {
  const response = await axios.post(
    `https://qacademico.ifce.edu.br/webapp/api/documentos/aluno/modelos-de-documentos/${idModel}/solicitacao`,
    {
      anoLetivo: schoolYear,
      idModelo: idModel,
      periodoLetivo: schoolPeriod,
      requerPersonalizacao: requiresCustomization,
    },
    {
      withCredentials: true,
      headers: {
        Cookie: cookies,
      },
    }
  );

  return response.data as DocumentRequestResponse;
}
